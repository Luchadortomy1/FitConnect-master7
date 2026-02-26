import { DayExercise, DayWorkout, WeekDay, WeeklyRoutine } from '@/types';
import { supabase } from '@/api/auth';

type RoutineRow = {
  id: string;
  name: string;
  goal?: string | null;
  level?: string | null;
  description?: string | null;
  content?: any;
  is_active?: boolean | null;
  created_at?: string | null;
};

const WEEK_ORDER: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    console.error('Error getting session:', error);
    return null;
  }
  return session.user.id;
};

const mapExercises = (exercises: any[] = [], routineId: string, dayKey: string): DayExercise[] => {
  return exercises.map((ex, idx) => ({
    id: ex.id || `${routineId}-${dayKey}-ex-${idx}`,
    name: ex.name || 'Ejercicio',
    muscle: ex.muscle || 'General',
    sets: ex.sets ?? 3,
    reps: ex.reps || '10',
    weight: ex.weight ?? undefined,
    notes: ex.notes || undefined,
    equipment: ex.equipment || undefined,
  }));
};

const mapRoutineRow = (row: RoutineRow, fallbackActive: boolean): WeeklyRoutine => {
  const days = (row.content?.days as any[]) || [];
  const weeklyPlan: WeeklyRoutine['weeklyPlan'] = {};

  days.forEach((day, idx) => {
    const dayKey = WEEK_ORDER[idx] || 'monday';
    weeklyPlan[dayKey] = {
      id: day.id || `${row.id}-${dayKey}`,
      name: day.name || day.day || `Día ${idx + 1}`,
      exercises: mapExercises(day.exercises || [], row.id, dayKey),
      estimatedDuration: day.estimatedDuration || day.duration || 60,
      notes: day.notes || undefined,
    } as DayWorkout;
  });

  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    weeklyPlan,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.created_at || new Date().toISOString(),
    isActive: row.is_active ?? fallbackActive,
  };
};

const fetchRoutines = async (): Promise<WeeklyRoutine[]> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.warn('No user ID available for fetching routines');
    return [];
  }

  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Supabase routines error:', error);
    throw error;
  }

  return (data as RoutineRow[]).map((row, idx) => mapRoutineRow(row, idx === 0));
};

const setActiveFlag = async (routineId: string) => {
  // Desactivar todas las otras rutinas
  const { error: deactivateError } = await supabase
    .from('routines')
    .update({ is_active: false })
    .neq('id', routineId);
  
  if (deactivateError) {
    console.error('Error deactivating other routines:', deactivateError);
  }

  // Activar la rutina seleccionada
  const { error: activateError } = await supabase
    .from('routines')
    .update({ is_active: true })
    .eq('id', routineId);
  
  if (activateError) {
    console.error('Error activating routine:', activateError);
  }
};

export const routinesApi = {
  async getRoutines(): Promise<WeeklyRoutine[]> {
    return fetchRoutines();
  },

  async getActiveRoutine(): Promise<WeeklyRoutine | null> {
    const routines = await fetchRoutines();
    return routines.find(r => r.isActive) || routines[0] || null;
  },

  async getRoutineById(id: string): Promise<WeeklyRoutine | null> {
    const { data, error } = await supabase.from('routines').select('*').eq('id', id).single();
    if (error) {
      console.error('Routine by id error:', error);
      return null;
    }
    return mapRoutineRow(data as RoutineRow, false);
  },

  async getTodayWorkout(): Promise<DayWorkout | null> {
    const active = await routinesApi.getActiveRoutine();
    if (!active) return null;
    const today = new Date().getDay();
    const dayName = WEEK_ORDER[(today + 6) % 7]; // map Sunday=0 to sunday index 6
    return active.weeklyPlan[dayName] || null;
  },

  async setActiveRoutine(id: string): Promise<void> {
    await setActiveFlag(id);
  },

  async deleteRoutine(id: string): Promise<void> {
    const { error } = await supabase.from('routines').delete().eq('id', id);
    if (error) {
      throw error;
    }
  },

  async createRoutine(routine: Omit<WeeklyRoutine, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeeklyRoutine> {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user authenticated');
    }

    // Convertir el formato de la app al formato de la tabla routines
    const routineData = {
      user_id: userId,
      name: routine.name,
      description: routine.description || null,
      goal: null,
      level: null,
      content: {
        days: Object.entries(routine.weeklyPlan).map(([dayKey, dayWorkout]) => ({
          id: dayWorkout.id,
          day: dayKey,
          name: dayWorkout.name,
          duration: dayWorkout.estimatedDuration,
          exercises: dayWorkout.exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            muscle: ex.muscle,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            notes: ex.notes,
            equipment: ex.equipment,
          })),
          notes: dayWorkout.notes,
        })),
      },
    };

    const { data, error } = await supabase
      .from('routines')
      .insert(routineData)
      .select()
      .single();

    if (error) {
      console.error('Error creating routine:', error);
      throw error;
    }

    return mapRoutineRow(data as RoutineRow, false);
  },

  async addExerciseToDay(routineId: string, dayKey: WeekDay, exercise: DayExercise): Promise<WeeklyRoutine> {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user authenticated');
    }

    // Get current routine
    const { data: routineData, error: fetchError } = await supabase
      .from('routines')
      .select('*')
      .eq('id', routineId)
      .single();

    if (fetchError) {
      console.error('Error fetching routine:', fetchError);
      throw fetchError;
    }

    const routine = routineData as RoutineRow;
    const content = routine.content || { days: [] };
    
    // Find or create the day
    let dayIndex = (content.days as any[]).findIndex((d: any) => d.day === dayKey);
    
    if (dayIndex === -1) {
      // Day doesn't exist, create it
      dayIndex = (content.days as any[]).length;
      (content.days as any[]).push({
        id: `${routineId}-${dayKey}`,
        day: dayKey,
        name: `Entrenamiento ${dayKey}`,
        exercises: [],
        duration: 60,
      });
    }

    // Add exercise to the day
    const dayExercises = (content.days as any[])[dayIndex].exercises || [];
    dayExercises.push({
      id: exercise.id,
      name: exercise.name,
      muscle: exercise.muscle,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      notes: exercise.notes,
      equipment: exercise.equipment,
    });

    (content.days as any[])[dayIndex].exercises = dayExercises;

    // Update routine in database
    const { data: updatedData, error: updateError } = await supabase
      .from('routines')
      .update({ content })
      .eq('id', routineId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating routine:', updateError);
      throw updateError;
    }

    return mapRoutineRow(updatedData as RoutineRow, false);
  },

  async deleteExerciseFromDay(routineId: string, dayKey: WeekDay, exerciseId: string): Promise<WeeklyRoutine> {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('No user authenticated');
    }

    // Get current routine
    const { data: routineData, error: fetchError } = await supabase
      .from('routines')
      .select('*')
      .eq('id', routineId)
      .single();

    if (fetchError) {
      console.error('Error fetching routine:', fetchError);
      throw fetchError;
    }

    const routine = routineData as RoutineRow;
    const content = routine.content || { days: [] };

    // Find the day and remove the exercise
    const dayIndex = (content.days as any[]).findIndex((d: any) => d.day === dayKey);
    if (dayIndex !== -1) {
      const day = (content.days as any[])[dayIndex];
      day.exercises = (day.exercises || []).filter((ex: any) => ex.id !== exerciseId);
    }

    // Update routine in database
    const { data: updatedData, error: updateError } = await supabase
      .from('routines')
      .update({ content })
      .eq('id', routineId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating routine:', updateError);
      throw updateError;
    }

    return mapRoutineRow(updatedData as RoutineRow, false);
  },
};

export default routinesApi;