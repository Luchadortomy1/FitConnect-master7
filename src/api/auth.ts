import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/supabase';
import { routinesApi } from '@/api/routines';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: async (key: string) => {
        try {
          // Intentar obtener chunks primero
          const chunksStr = await SecureStore.getItemAsync(`${key}_chunks`);
          if (chunksStr) {
            const chunks = parseInt(chunksStr);
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
            const chunks = parseInt(chunksStr);
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
    autoRefreshToken: true,
    persistSession: true,
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
      // Crear o actualizar perfil del usuario (upsert)
      const { data: insertedProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: name,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return {
          success: false,
          error: `Error al crear perfil: ${profileError.message}`,
          profileError: true,
        };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: insertedProfile?.full_name || name,
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, error: error.message || 'Logout failed' };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }

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

    // Obtener el goal anterior del usuario
    let previousGoal = null;
    if (profileData.goal !== undefined) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('goal')
          .eq('id', userId)
          .single();
        previousGoal = profile?.goal || null;
      } catch (error) {
        console.warn('Error fetching previous goal:', error);
      }
    }

    // Mapear campos al formato de la base de datos
    if (profileData.name !== undefined) updateData.full_name = profileData.name;
    if (profileData.age !== undefined) updateData.age = profileData.age;
    if (profileData.weight !== undefined) updateData.weight = profileData.weight;
    if (profileData.height !== undefined) updateData.height = profileData.height;
    if (profileData.goal !== undefined) updateData.goal = profileData.goal;
    if (profileData.activityLevel !== undefined) updateData.activity_level = profileData.activityLevel;
    if (profileData.targetCalories !== undefined) updateData.target_calories = profileData.targetCalories;
    if (profileData.targetProtein !== undefined) updateData.target_protein = profileData.targetProtein;
    if (profileData.targetCarbs !== undefined) updateData.target_carbs = profileData.targetCarbs;
    if (profileData.targetFat !== undefined) updateData.target_fat = profileData.targetFat;

    console.log('Updating profile with data:', updateData);

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    // Si el objetivo cambió, eliminar TODAS las rutinas del usuario
    if (profileData.goal !== undefined && previousGoal && profileData.goal !== previousGoal) {
      console.log('Objetivo cambió de:', previousGoal, 'a:', profileData.goal);
      console.log('Eliminando TODAS las rutinas del usuario...');
      
      const deleteSuccess = await routinesApi.deleteAllRoutinesForUser(userId);
      if (deleteSuccess) {
        console.log('Todas las rutinas eliminadas exitosamente');
      } else {
        console.warn('Hubo un problema al eliminar las rutinas');
      }
    }

    console.log('Profile updated successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message || 'Update failed' };
  }
};