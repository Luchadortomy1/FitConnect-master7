import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/supabase';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: async (key: string) => {
        try {
          // Intentar obtener chunks primero
          const chunksStr = await SecureStore.getItemAsync(`${key}_chunks`);
          if (chunksStr) {
            const chunks = Number.parseInt(chunksStr);
            let value = '';
            for (let i = 0; i < chunks; i++) {
              const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
              if (chunk) value += chunk;
            }
            return value || null;
          }
          
          // Si no hay chunks, obtener valor normal
          return await SecureStore.getItemAsync(key);
        } catch (error) {
          console.warn('SecureStore getItem error:', error);
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          // Dividir tokens grandes en chunks más pequeños
          if (value.length > 2000) {
            const chunks = [];
            for (let i = 0; i < value.length; i += 2000) {
              chunks.push(value.slice(i, i + 2000));
            }
            
            // Almacenar número de chunks
            await SecureStore.setItemAsync(`${key}_chunks`, chunks.length.toString());
            
            // Almacenar cada chunk
            for (let i = 0; i < chunks.length; i++) {
              await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
            }
          } else {
            await SecureStore.setItemAsync(key, value);
          }
        } catch (error) {
          console.warn('SecureStore setItem error:', error);
        }
      },
      removeItem: async (key: string) => {
        try {
          // Remover chunks si existen
          const chunksStr = await SecureStore.getItemAsync(`${key}_chunks`);
          if (chunksStr) {
            const chunks = Number.parseInt(chunksStr);
            await SecureStore.deleteItemAsync(`${key}_chunks`);
            for (let i = 0; i < chunks; i++) {
              await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
            }
          }
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          console.warn('SecureStore removeItem error:', error);
        }
      },
    },
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// Auth API functions
export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user && data.session) {
      // Obtener perfil del usuario desde la tabla profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.full_name || '',
          age: profile?.age || undefined,
          weight: profile?.weight || undefined,
          height: profile?.height || undefined,
          goal: profile?.goal || undefined,
          activityLevel: profile?.activity_level || undefined,
          targetCalories: profile?.target_calories || undefined,
          targetProtein: profile?.target_protein || undefined,
          targetCarbs: profile?.target_carbs || undefined,
          targetFat: profile?.target_fat || undefined,
        },
        session: data.session,
      };
    }

    return { success: false, error: 'No user data received' };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'Login failed' };
  }
};

export const signup = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // Crear perfil del usuario
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: name,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: name,
        },
        session: data.session,
        needsConfirmation: !data.session, // Si no hay sesión, necesita confirmación por email
      };
    }

    return { success: false, error: 'No user data received' };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { success: false, error: error.message || 'Signup failed' };
  }
};

export const logout = async () => {
  try {
    // Cerrar sesión en Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    
    // Limpiar todos los tokens almacenados
    await clearAllStoredTokens();
    
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, error: error.message || 'Logout failed' };
  }
};

// Función para limpiar todos los tokens almacenados
export const clearAllStoredTokens = async () => {
  try {
    const keys = [
      'supabase.auth.token',
      'sb-figcxjmchiqzizxstezm-auth-token',
      // Agregar más keys si es necesario
    ];
    
    for (const key of keys) {
      try {
        // Limpiar chunks si existen
        const chunksStr = await SecureStore.getItemAsync(`${key}_chunks`);
        if (chunksStr) {
          const chunks = Number.parseInt(chunksStr);
          await SecureStore.deleteItemAsync(`${key}_chunks`);
          for (let i = 0; i < chunks; i++) {
            await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
          }
        }
        
        // Limpiar key normal
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.warn(`Error clearing ${key}:`, error);
      }
    }
  } catch (error) {
    console.warn('Error clearing all stored tokens:', error);
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }

    if (user) {
      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      return {
        id: user.id,
        email: user.email,
        name: profile?.full_name || '',
        age: profile?.age || undefined,
        weight: profile?.weight || undefined,
        height: profile?.height || undefined,
        goal: profile?.goal || undefined,
        activityLevel: profile?.activity_level || undefined,
        targetCalories: profile?.target_calories || undefined,
        targetProtein: profile?.target_protein || undefined,
        targetCarbs: profile?.target_carbs || undefined,
        targetFat: profile?.target_fat || undefined,
      };
    }

    return null;
  } catch (error: any) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const updateProfile = async (userId: string, profileData: any) => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Mapear campos al formato de la base de datos
    if (profileData.name) updateData.full_name = profileData.name;
    if (profileData.age) updateData.age = profileData.age;
    if (profileData.weight) updateData.weight = profileData.weight;
    if (profileData.height) updateData.height = profileData.height;
    if (profileData.goal) updateData.goal = profileData.goal;
    if (profileData.activityLevel) updateData.activity_level = profileData.activityLevel;
    if (profileData.targetCalories) updateData.target_calories = profileData.targetCalories;
    if (profileData.targetProtein) updateData.target_protein = profileData.targetProtein;
    if (profileData.targetCarbs) updateData.target_carbs = profileData.targetCarbs;
    if (profileData.targetFat) updateData.target_fat = profileData.targetFat;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message || 'Update failed' };
  }
};