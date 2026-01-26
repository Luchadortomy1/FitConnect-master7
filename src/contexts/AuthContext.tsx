import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { User } from '@/types';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getCurrentUser, updateProfile, supabase } from '@/api/auth';
import * as SecureStore from 'expo-secure-store';

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
  const [loading, setLoading] = useState(true);

  // Verificar sesión al inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
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
      setLoading(true);
      const result = await apiLogin(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
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
      // Limpiar cualquier token almacenado
      await SecureStore.deleteItemAsync('supabase.auth.token');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
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
    login,
    signup,
    logout,
    updateUser,
  }), [user]);

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