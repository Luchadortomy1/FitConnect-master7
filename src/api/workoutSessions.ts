import { supabase } from '@/api/auth';

interface WorkoutSessionData {
  routine_id: string;
  day_key: string;
  exercises_data: any[];
  completed_sets: number;
  total_sets: number;
  completion_rate: number;
  elapsed_time_seconds: number;
}

const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    console.error('Error getting session:', error);
    return null;
  }
  return session.user.id;
};

export const workoutSessionsApi = {
  /**
   * Guardar una sesión de entrenamiento completada
   */
  saveSession: async (sessionData: WorkoutSessionData) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          routine_id: sessionData.routine_id,
          day_key: sessionData.day_key,
          exercises_data: sessionData.exercises_data,
          completed_sets: sessionData.completed_sets,
          total_sets: sessionData.total_sets,
          completion_rate: sessionData.completion_rate,
          elapsed_time_seconds: sessionData.elapsed_time_seconds,
          completed_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error('Error saving workout session:', error);
        throw error;
      }

      console.log('Workout session saved:', data);
      return data;
    } catch (error) {
      console.error('Error in saveSession:', error);
      throw error;
    }
  },

  /**
   * Obtener histórico de sesiones del usuario
   */
  getSessions: async (limit: number = 30) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching workout sessions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSessions:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de entrenamiento del usuario
   */
  getStats: async (days: number = 30) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const dateFromDaysAgo = new Date();
      dateFromDaysAgo.setDate(dateFromDaysAgo.getDate() - days);

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('completed_at', dateFromDaysAgo.toISOString());

      if (error) {
        console.error('Error fetching stats:', error);
        throw error;
      }

      const sessions = data || [];
      const totalSessions = sessions.length;
      const totalTime = sessions.reduce((sum, s) => sum + (s.elapsed_time_seconds || 0), 0);
      const avgCompletion = sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + (s.completion_rate || 0), 0) / sessions.length)
        : 0;

      return {
        totalSessions,
        totalTimeSeconds: totalTime,
        averageCompletion: avgCompletion,
        sessions,
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      throw error;
    }
  },
};
