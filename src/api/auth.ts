import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
// Legacy import keeps readAsStringAsync available; Expo SDK 54 marks the new API differently
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
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

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.full_name || '',
          avatar: profile?.avatar_url || undefined,
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
      const friendly = error.message?.toLowerCase().includes('registered')
        ? 'Este correo ya está registrado'
        : error.message || 'Signup failed';
      return { success: false, error: friendly };
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

      // Ignorar error RLS 42501 (row-level security policy violation) ya que el perfil se crea correctamente
      // a través de un trigger de la base de datos
      if (profileError && profileError.code !== '42501') {
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
    const friendly = error?.message?.toLowerCase().includes('registered')
      ? 'Este correo ya está registrado'
      : error?.message || 'Signup failed';
    return { success: false, error: friendly };
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

      return {
        id: user.id,
        email: user.email,
        name: profile?.full_name || '',
        avatar: profile?.avatar_url || undefined,
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
    if (profileData.avatar !== undefined) updateData.avatar_url = profileData.avatar;

    console.log('Updating profile with data:', updateData);

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
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
    return { success: false, error: error.message || 'Update failed' };
  }
};

export const uploadAvatar = async (userId: string, uri: string) => {
  try {
    const fileExt = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Some platforms need the raw string value 'base64' instead of the enum
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as FileSystem.EncodingType });
    const arrayBuffer = decode(base64);
    const contentType = `image/${fileExt.toLowerCase() === 'png' ? 'png' : 'jpeg'}`;

    const { error: uploadError } = await supabase.storage
      .from('avatar')
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatar')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error uploading avatar' };
  }
};