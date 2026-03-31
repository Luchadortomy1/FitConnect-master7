import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import { Alert, Linking } from 'react-native';
import { User } from '@/types';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getCurrentUser, updateProfile, supabase } from '@/api/auth';
import * as SecureStore from 'expo-secure-store';
import { navigationHelper } from '@/navigation/navigationHelper';

const AUTH_DISABLED = false; // Toggle to re-enable Supabase auth when ready

const GUEST_USER: User = {
  id: 'guest',
  email: 'guest@example.com',
  name: 'Invitado',
  age: 25,
  weight: 70,
  height: 175,
  goal: 'maintain',
  activityLevel: 'moderate',
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!AUTH_DISABLED);
  const processedDeepLinks = useRef<Set<string>>(new Set());

  // Skip Supabase auth wiring while auth is disabled
  useEffect(() => {
    if (AUTH_DISABLED) {
      setLoading(false);
      return;
    }

    // Mantener loading hasta recibir INITIAL_SESSION
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
          } else {
            setUser(null);
          }
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Handle Supabase deep links for email confirmation and password recovery
  useEffect(() => {
    if (AUTH_DISABLED) return;

    const parseUrlParams = (url: string) => {
      try {
        const hash = url.split('#')[1] || '';
        const query = url.split('?')[1]?.split('#')[0] || '';
        // Supabase puts tokens in the hash; some platforms may drop it to query
        return new URLSearchParams(hash || query);
      } catch (error) {
        return new URLSearchParams();
      }
    };

    const navigateWhenReady = (action: () => void, attempts = 0) => {
      if (navigationHelper.navigationRef?.isReady()) {
        action();
        return;
      }
      if (attempts > 40) return; // ~2s guard
      setTimeout(() => navigateWhenReady(action, attempts + 1), 50);
    };

    const handleAuthDeepLink = async (url: string) => {
      if (!url || processedDeepLinks.current.has(url)) return;

      processedDeepLinks.current.add(url);

      try {
        const params = parseUrlParams(url);
        let type = params.get('type');

        // Fallback detection if type is missing
        if (!type) {
          if (url.includes('reset-password')) type = 'recovery';
          if (url.includes('email-confirm')) type = 'signup';
        }

        console.log('Deep link received', { url, type, hasAccessToken: params.has('access_token'), hasRefreshToken: params.has('refresh_token') });

        let { data, error } = await supabase.auth.getSessionFromUrl({ url, storeSession: true });

        if (error) {
          console.warn('Deep link session error:', error.message);

          // Fallback: try verifyOtp with token_hash if available
          const tokenHash = params.get('token');
          if (tokenHash && (type === 'recovery' || type === 'signup')) {
            const verifyType = type === 'recovery' ? 'recovery' : 'signup';
            const verify = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: verifyType });
            if (verify.data?.session) {
              data = verify.data;
              error = null;
            } else if (verify.error) {
              console.warn('Fallback verifyOtp error:', verify.error.message);
            }
          }

          if (error) {
            if (error.message.includes('Invalid Refresh Token')) {
              await supabase.auth.signOut();
              await SecureStore.deleteItemAsync('supabase.auth.token');
            }
            processedDeepLinks.current.delete(url);
            Alert.alert('Enlace no válido', 'El enlace de autenticación no se pudo validar. Intenta de nuevo.');
            return;
          }
        }

        if (data.session) {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }

        // Navigate based on the auth event type
        if (type === 'recovery') {
          Alert.alert(
            'Recupera tu contraseña',
            'Validamos tu enlace. Crea tu nueva contraseña directamente en la app.'
          );
          navigateWhenReady(() => navigationHelper.navigate('PasswordReset'));
        } else if (type === 'signup') {
          Alert.alert(
            'Correo verificado',
            'Tu correo fue confirmado. Ya puedes entrar a FitConnect.'
          );
          navigateWhenReady(() => navigationHelper.navigate('Main'));
        } else {
          // If we got a session but no type, still move past login
          navigateWhenReady(() => navigationHelper.navigate('Main'));
        }
      } catch (error) {
        console.warn('Error handling auth deep link:', error);
        processedDeepLinks.current.delete(url);
        Alert.alert('Enlace no válido', 'No se pudo procesar el enlace. Intenta de nuevo.');
      }
    };

    const deepLinkListener = Linking.addEventListener('url', ({ url }) => {
      handleAuthDeepLink(url);
    });

    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        handleAuthDeepLink(initialUrl);
      }
    });

    return () => {
      deepLinkListener.remove();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (AUTH_DISABLED) {
      setLoading(true);
      setUser({
        ...GUEST_USER,
        email: email || GUEST_USER.email,
        name: email ? email.split('@')[0] || GUEST_USER.name : GUEST_USER.name,
      });
      setLoading(false);
      return { success: true };
    }

    try {
      setLoading(true);
      const result = await apiLogin(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      
      return { success: false, error: result?.error || 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    if (AUTH_DISABLED) {
      setLoading(true);
      setUser({
        ...GUEST_USER,
        email: email || GUEST_USER.email,
        name: name || email?.split('@')[0] || GUEST_USER.name,
      });
      setLoading(false);
      return { success: true };
    }

    try {
      setLoading(true);
      const result = await apiSignup(email, password, name);
      
      if (result.success) {
        if (result.needsConfirmation) {
          return { 
            success: true, 
            needsConfirmation: true 
          };
        }
        
        if (result.user) {
          setUser(result.user);
        }
        
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Signup failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (AUTH_DISABLED) {
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      await apiLogout();
      setUser(null);
      // Limpiar cualquier token almacenado
      await SecureStore.deleteItemAsync('supabase.auth.token');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (AUTH_DISABLED) {
      setUser(prev => prev ? { ...prev, ...userData } : { ...GUEST_USER, ...userData });
      return { success: true };
    }

    if (user) {
      try {
        console.log('Updating user with data:', userData);
        // Actualizar en la base de datos
        const result = await updateProfile(user.id, userData);
        
        if (result?.success) {
          // Actualizar estado local solo si la actualización en BD fue exitosa
          setUser({ ...user, ...userData });
          return { success: true };
        } else {
          console.error('Error updating profile:', result?.error || 'Unknown error');
          return { success: false, error: result?.error || 'Error al actualizar perfil' };
        }
      } catch (error: any) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message || 'Error al actualizar perfil' };
      }
    }
    return { success: false, error: 'No hay usuario logueado' };
  };

  const value: AuthContextType = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    updateUser,
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};