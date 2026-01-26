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
  const { data, error } = await supabase.from('routines').select('*');
  if (error) {
    console.error('Supabase routines error:', error);
    throw error;
  }

  return (data as RoutineRow[]).map((row, idx) => mapRoutineRow(row, idx === 0));
};

const setActiveFlag = async (routineId: string) => {
  // Intentar usar columna is_active si existe; si no, no fallar fuerte
  const { error } = await supabase.rpc('set_active_routine', { routine_id: routineId }).catch(() => ({ error: null as any }));
  if (error && error.code !== '42883') {
    // 42883 = función no existe; en ese caso seguimos con fallback
    console.warn('RPC set_active_routine no disponible, intentando update directo');
  }

  const { error: updateError } = await supabase.from('routines').update({ is_active: false }).neq('id', routineId);
  if (updateError && updateError.code === '42703') {
    // Columna no existe, ignorar
    return;
  }

  if (!updateError) {
    await supabase.from('routines').update({ is_active: true }).eq('id', routineId);
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
};

export default routinesApi;