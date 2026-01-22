import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { User } from '@/types';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getCurrentUser, updateProfile, clearAllStoredTokens, supabase } from '@/api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  hasLoggedOut: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  // Verificar sesión al inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Limpiar cualquier sesión almacenada al iniciar la app
        await clearAllStoredTokens();
        await apiLogout();
        
        // Solo verificar sesión activa después de limpiar
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
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

  const login = async (email: string, password: string) => {
    try {
      const result = await apiLogin(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        setHasLoggedOut(false); // Resetear flag de logout
        console.log('Login successful - user set:', result.user.email);
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
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
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiLogout();
      setUser(null);
      setHasLoggedOut(true); // Marcar que se hizo logout manual
      // Limpiar cualquier token almacenado
      await clearAllStoredTokens();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      try {
        // Actualizar en la base de datos
        const result = await updateProfile(user.id, userData);
        
        if (result.success) {
          // Actualizar estado local solo si la actualización en BD fue exitosa
          setUser({ ...user, ...userData });
          return { success: true };
        } else {
          console.error('Error updating profile:', result.error);
          return { success: false, error: result.error };
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
    hasLoggedOut,
    login,
    signup,
    logout,
    updateUser,
  }), [user, loading, hasLoggedOut]);

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