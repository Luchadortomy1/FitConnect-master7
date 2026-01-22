import { WeeklyRoutine, DayWorkout, WeekDay } from '@/types';

// Mock data for weekly routines
const mockRoutines: WeeklyRoutine[] = [
  {
    id: '1',
    name: 'Push/Pull/Legs Split',
    description: 'Rutina clásica de 6 días enfocada en fuerza y hipertrofia',
    weeklyPlan: {
      monday: {
        id: 'day-1',
        name: 'Push Day - Pecho, Hombros y Tríceps',
        exercises: [
          { id: 'ex-1', name: 'Press de Banca', muscle: 'Pecho', sets: 4, reps: '8-10', weight: 80, equipment: 'Barra' },
          { id: 'ex-2', name: 'Press Inclinado con Mancuernas', muscle: 'Pecho', sets: 3, reps: '10-12', weight: 30, equipment: 'Mancuernas' },
          { id: 'ex-3', name: 'Aperturas con Mancuernas', muscle: 'Pecho', sets: 3, reps: '12-15', weight: 15, equipment: 'Mancuernas' },
          { id: 'ex-4', name: 'Press Militar', muscle: 'Hombros', sets: 4, reps: '8-10', weight: 60, equipment: 'Barra' },
          { id: 'ex-5', name: 'Elevaciones Laterales', muscle: 'Hombros', sets: 3, reps: '12-15', weight: 12, equipment: 'Mancuernas' },
          { id: 'ex-6', name: 'Press Francés', muscle: 'Tríceps', sets: 3, reps: '10-12', weight: 40, equipment: 'Barra Z' },
        ],
        estimatedDuration: 90,
      },
      tuesday: {
        id: 'day-2',
        name: 'Pull Day - Espalda y Bíceps',
        exercises: [
          { id: 'ex-7', name: 'Dominadas', muscle: 'Espalda', sets: 4, reps: '6-10', equipment: 'Peso corporal' },
          { id: 'ex-8', name: 'Remo con Barra', muscle: 'Espalda', sets: 4, reps: '8-10', weight: 70, equipment: 'Barra' },
          { id: 'ex-9', name: 'Jalones al Pecho', muscle: 'Espalda', sets: 3, reps: '10-12', weight: 60, equipment: 'Polea' },
          { id: 'ex-10', name: 'Remo con Mancuernas', muscle: 'Espalda', sets: 3, reps: '10-12', weight: 35, equipment: 'Mancuernas' },
          { id: 'ex-11', name: 'Curl con Barra', muscle: 'Bíceps', sets: 3, reps: '10-12', weight: 30, equipment: 'Barra' },
          { id: 'ex-12', name: 'Curl Martillo', muscle: 'Bíceps', sets: 3, reps: '12-15', weight: 15, equipment: 'Mancuernas' },
        ],
        estimatedDuration: 85,
      },
      wednesday: {
        id: 'day-3',
        name: 'Leg Day - Piernas Completo',
        exercises: [
          { id: 'ex-13', name: 'Sentadillas', muscle: 'Cuádriceps', sets: 4, reps: '8-10', weight: 100, equipment: 'Barra' },
          { id: 'ex-14', name: 'Peso Muerto Rumano', muscle: 'Femorales', sets: 4, reps: '8-10', weight: 80, equipment: 'Barra' },
          { id: 'ex-15', name: 'Prensa de Piernas', muscle: 'Cuádriceps', sets: 3, reps: '12-15', weight: 180, equipment: 'Máquina' },
          { id: 'ex-16', name: 'Curl Femoral', muscle: 'Femorales', sets: 3, reps: '12-15', weight: 45, equipment: 'Máquina' },
          { id: 'ex-17', name: 'Elevaciones de Pantorrillas', muscle: 'Pantorrillas', sets: 4, reps: '15-20', weight: 120, equipment: 'Máquina' },
          { id: 'ex-18', name: 'Extensiones de Cuádriceps', muscle: 'Cuádriceps', sets: 3, reps: '12-15', weight: 50, equipment: 'Máquina' },
        ],
        estimatedDuration: 95,
      },
      thursday: {
        id: 'day-4',
        name: 'Push Day - Pecho, Hombros y Tríceps',
        exercises: [
          { id: 'ex-19', name: 'Press Inclinado con Barra', muscle: 'Pecho', sets: 4, reps: '8-10', weight: 70, equipment: 'Barra' },
          { id: 'ex-20', name: 'Press con Mancuernas', muscle: 'Pecho', sets: 3, reps: '10-12', weight: 35, equipment: 'Mancuernas' },
          { id: 'ex-21', name: 'Fondos en Paralelas', muscle: 'Pecho', sets: 3, reps: '10-15', equipment: 'Peso corporal' },
          { id: 'ex-22', name: 'Elevaciones Frontales', muscle: 'Hombros', sets: 3, reps: '12-15', weight: 10, equipment: 'Mancuernas' },
          { id: 'ex-23', name: 'Pájaros', muscle: 'Hombros', sets: 3, reps: '12-15', weight: 8, equipment: 'Mancuernas' },
          { id: 'ex-24', name: 'Extensiones de Tríceps', muscle: 'Tríceps', sets: 3, reps: '10-12', weight: 25, equipment: 'Polea' },
        ],
        estimatedDuration: 85,
      },
      friday: {
        id: 'day-5',
        name: 'Pull Day - Espalda y Bíceps',
        exercises: [
          { id: 'ex-25', name: 'Peso Muerto', muscle: 'Espalda', sets: 4, reps: '5-8', weight: 120, equipment: 'Barra' },
          { id: 'ex-26', name: 'Remo en T', muscle: 'Espalda', sets: 3, reps: '10-12', weight: 60, equipment: 'Barra T' },
          { id: 'ex-27', name: 'Pulldown Neutral', muscle: 'Espalda', sets: 3, reps: '10-12', weight: 55, equipment: 'Polea' },
          { id: 'ex-28', name: 'Encogimientos', muscle: 'Trapecios', sets: 3, reps: '12-15', weight: 40, equipment: 'Mancuernas' },
          { id: 'ex-29', name: 'Curl Concentrado', muscle: 'Bíceps', sets: 3, reps: '10-12', weight: 15, equipment: 'Mancuernas' },
          { id: 'ex-30', name: 'Curl en Polea', muscle: 'Bíceps', sets: 3, reps: '12-15', weight: 30, equipment: 'Polea' },
        ],
        estimatedDuration: 90,
      },
      saturday: {
        id: 'day-6',
        name: 'Leg Day - Piernas y Glúteos',
        exercises: [
          { id: 'ex-31', name: 'Sentadilla Búlgara', muscle: 'Cuádriceps', sets: 3, reps: '10-12', weight: 20, equipment: 'Mancuernas' },
          { id: 'ex-32', name: 'Hip Thrust', muscle: 'Glúteos', sets: 4, reps: '12-15', weight: 80, equipment: 'Barra' },
          { id: 'ex-33', name: 'Zancadas', muscle: 'Cuádriceps', sets: 3, reps: '12-15', weight: 25, equipment: 'Mancuernas' },
          { id: 'ex-34', name: 'Curl Nórdico', muscle: 'Femorales', sets: 3, reps: '5-8', equipment: 'Peso corporal' },
          { id: 'ex-35', name: 'Caminata de Granjero', muscle: 'Full Body', sets: 3, reps: '30 pasos', weight: 40, equipment: 'Mancuernas' },
          { id: 'ex-36', name: 'Plancha', muscle: 'Core', sets: 3, reps: '45-60 seg', equipment: 'Peso corporal' },
        ],
        estimatedDuration: 80,
      },
    },
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
    isActive: true,
  },
  {
    id: '2',
    name: 'Upper/Lower Split',
    description: 'Rutina de 4 días alternando tren superior e inferior',
    weeklyPlan: {
      monday: {
        id: 'day-7',
        name: 'Upper Body - Tren Superior',
        exercises: [
          { id: 'ex-37', name: 'Press de Banca', muscle: 'Pecho', sets: 4, reps: '6-8', weight: 85, equipment: 'Barra' },
          { id: 'ex-38', name: 'Remo con Barra', muscle: 'Espalda', sets: 4, reps: '6-8', weight: 75, equipment: 'Barra' },
          { id: 'ex-39', name: 'Press Militar', muscle: 'Hombros', sets: 3, reps: '8-10', weight: 55, equipment: 'Barra' },
          { id: 'ex-40', name: 'Dominadas', muscle: 'Espalda', sets: 3, reps: '8-12', equipment: 'Peso corporal' },
          { id: 'ex-41', name: 'Fondos', muscle: 'Tríceps', sets: 3, reps: '10-15', equipment: 'Peso corporal' },
          { id: 'ex-42', name: 'Curl con Barra', muscle: 'Bíceps', sets: 3, reps: '10-12', weight: 30, equipment: 'Barra' },
        ],
        estimatedDuration: 75,
      },
      tuesday: {
        id: 'day-8',
        name: 'Lower Body - Tren Inferior',
        exercises: [
          { id: 'ex-43', name: 'Sentadillas', muscle: 'Cuádriceps', sets: 4, reps: '6-8', weight: 110, equipment: 'Barra' },
          { id: 'ex-44', name: 'Peso Muerto Rumano', muscle: 'Femorales', sets: 4, reps: '6-8', weight: 90, equipment: 'Barra' },
          { id: 'ex-45', name: 'Prensa de Piernas', muscle: 'Cuádriceps', sets: 3, reps: '12-15', weight: 200, equipment: 'Máquina' },
          { id: 'ex-46', name: 'Curl Femoral', muscle: 'Femorales', sets: 3, reps: '12-15', weight: 50, equipment: 'Máquina' },
          { id: 'ex-47', name: 'Elevaciones de Pantorrillas', muscle: 'Pantorrillas', sets: 4, reps: '15-20', weight: 140, equipment: 'Máquina' },
        ],
        estimatedDuration: 70,
      },
      thursday: {
        id: 'day-9',
        name: 'Upper Body - Tren Superior',
        exercises: [
          { id: 'ex-48', name: 'Press Inclinado', muscle: 'Pecho', sets: 4, reps: '8-10', weight: 70, equipment: 'Barra' },
          { id: 'ex-49', name: 'Jalones al Pecho', muscle: 'Espalda', sets: 4, reps: '8-10', weight: 65, equipment: 'Polea' },
          { id: 'ex-50', name: 'Elevaciones Laterales', muscle: 'Hombros', sets: 3, reps: '12-15', weight: 12, equipment: 'Mancuernas' },
          { id: 'ex-51', name: 'Remo con Mancuernas', muscle: 'Espalda', sets: 3, reps: '10-12', weight: 35, equipment: 'Mancuernas' },
          { id: 'ex-52', name: 'Press Francés', muscle: 'Tríceps', sets: 3, reps: '10-12', weight: 35, equipment: 'Barra Z' },
          { id: 'ex-53', name: 'Curl Martillo', muscle: 'Bíceps', sets: 3, reps: '12-15', weight: 15, equipment: 'Mancuernas' },
        ],
        estimatedDuration: 75,
      },
      friday: {
        id: 'day-10',
        name: 'Lower Body - Tren Inferior',
        exercises: [
          { id: 'ex-54', name: 'Peso Muerto', muscle: 'Espalda', sets: 4, reps: '5-6', weight: 130, equipment: 'Barra' },
          { id: 'ex-55', name: 'Sentadilla Frontal', muscle: 'Cuádriceps', sets: 3, reps: '8-10', weight: 70, equipment: 'Barra' },
          { id: 'ex-56', name: 'Hip Thrust', muscle: 'Glúteos', sets: 3, reps: '12-15', weight: 90, equipment: 'Barra' },
          { id: 'ex-57', name: 'Zancadas', muscle: 'Cuádriceps', sets: 3, reps: '12-15', weight: 30, equipment: 'Mancuernas' },
          { id: 'ex-58', name: 'Gemelos Sentado', muscle: 'Pantorrillas', sets: 4, reps: '15-20', weight: 60, equipment: 'Máquina' },
        ],
        estimatedDuration: 75,
      },
    },
    createdAt: '2024-09-15T09:00:00Z',
    updatedAt: '2024-10-10T16:45:00Z',
    isActive: false,
  },
];

// Mock exercises database for creating new workouts
export const exercisesDatabase = [
  // Pecho
  { id: 'db-1', name: 'Press de Banca', muscle: 'Pecho', equipment: 'Barra' },
  { id: 'db-2', name: 'Press Inclinado', muscle: 'Pecho', equipment: 'Barra' },
  { id: 'db-3', name: 'Press con Mancuernas', muscle: 'Pecho', equipment: 'Mancuernas' },
  { id: 'db-4', name: 'Aperturas', muscle: 'Pecho', equipment: 'Mancuernas' },
  { id: 'db-5', name: 'Fondos en Paralelas', muscle: 'Pecho', equipment: 'Peso corporal' },
  
  // Espalda
  { id: 'db-6', name: 'Dominadas', muscle: 'Espalda', equipment: 'Peso corporal' },
  { id: 'db-7', name: 'Remo con Barra', muscle: 'Espalda', equipment: 'Barra' },
  { id: 'db-8', name: 'Jalones al Pecho', muscle: 'Espalda', equipment: 'Polea' },
  { id: 'db-9', name: 'Remo con Mancuernas', muscle: 'Espalda', equipment: 'Mancuernas' },
  { id: 'db-10', name: 'Peso Muerto', muscle: 'Espalda', equipment: 'Barra' },
  
  // Hombros
  { id: 'db-11', name: 'Press Militar', muscle: 'Hombros', equipment: 'Barra' },
  { id: 'db-12', name: 'Elevaciones Laterales', muscle: 'Hombros', equipment: 'Mancuernas' },
  { id: 'db-13', name: 'Elevaciones Frontales', muscle: 'Hombros', equipment: 'Mancuernas' },
  { id: 'db-14', name: 'Pájaros', muscle: 'Hombros', equipment: 'Mancuernas' },
  { id: 'db-15', name: 'Press con Mancuernas', muscle: 'Hombros', equipment: 'Mancuernas' },
  
  // Brazos
  { id: 'db-16', name: 'Curl con Barra', muscle: 'Bíceps', equipment: 'Barra' },
  { id: 'db-17', name: 'Curl Martillo', muscle: 'Bíceps', equipment: 'Mancuernas' },
  { id: 'db-18', name: 'Press Francés', muscle: 'Tríceps', equipment: 'Barra Z' },
  { id: 'db-19', name: 'Fondos', muscle: 'Tríceps', equipment: 'Peso corporal' },
  { id: 'db-20', name: 'Extensiones de Tríceps', muscle: 'Tríceps', equipment: 'Polea' },
  
  // Piernas
  { id: 'db-21', name: 'Sentadillas', muscle: 'Cuádriceps', equipment: 'Barra' },
  { id: 'db-22', name: 'Prensa de Piernas', muscle: 'Cuádriceps', equipment: 'Máquina' },
  { id: 'db-23', name: 'Peso Muerto Rumano', muscle: 'Femorales', equipment: 'Barra' },
  { id: 'db-24', name: 'Curl Femoral', muscle: 'Femorales', equipment: 'Máquina' },
  { id: 'db-25', name: 'Elevaciones de Pantorrillas', muscle: 'Pantorrillas', equipment: 'Máquina' },
  { id: 'db-26', name: 'Zancadas', muscle: 'Cuádriceps', equipment: 'Mancuernas' },
  { id: 'db-27', name: 'Hip Thrust', muscle: 'Glúteos', equipment: 'Barra' },
  { id: 'db-28', name: 'Extensiones de Cuádriceps', muscle: 'Cuádriceps', equipment: 'Máquina' },
  
  // Core
  { id: 'db-29', name: 'Plancha', muscle: 'Core', equipment: 'Peso corporal' },
  { id: 'db-30', name: 'Abdominales', muscle: 'Core', equipment: 'Peso corporal' },
  { id: 'db-31', name: 'Russian Twists', muscle: 'Core', equipment: 'Peso corporal' },
  { id: 'db-32', name: 'Mountain Climbers', muscle: 'Core', equipment: 'Peso corporal' },
];

// API Functions
export const routinesApi = {
  // Get all routines
  getRoutines: (): Promise<WeeklyRoutine[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockRoutines), 500);
    });
  },

  // Get active routine
  getActiveRoutine: (): Promise<WeeklyRoutine | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeRoutine = mockRoutines.find(routine => routine.isActive) || null;
        resolve(activeRoutine);
      }, 300);
    });
  },

  // Get routine by ID
  getRoutineById: (id: string): Promise<WeeklyRoutine | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const routine = mockRoutines.find(r => r.id === id) || null;
        resolve(routine);
      }, 300);
    });
  },

  // Get today's workout
  getTodayWorkout: (): Promise<DayWorkout | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeRoutine = mockRoutines.find(routine => routine.isActive);
        if (!activeRoutine) {
          resolve(null);
          return;
        }

        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayName = dayNames[today];
        
        const todayWorkout = activeRoutine.weeklyPlan[todayName] || null;
        resolve(todayWorkout);
      }, 300);
    });
  },

  // Create new routine
  createRoutine: (routine: Omit<WeeklyRoutine, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeeklyRoutine> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRoutine: WeeklyRoutine = {
          ...routine,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockRoutines.unshift(newRoutine);
        resolve(newRoutine);
      }, 500);
    });
  },

  // Update routine
  updateRoutine: (id: string, updates: Partial<WeeklyRoutine>): Promise<WeeklyRoutine> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockRoutines.findIndex(r => r.id === id);
        if (index === -1) {
          reject(new Error('Routine not found'));
          return;
        }

        mockRoutines[index] = {
          ...mockRoutines[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        resolve(mockRoutines[index]);
      }, 500);
    });
  },

  // Set active routine
  setActiveRoutine: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Deactivate all routines
        for (const routine of mockRoutines) {
          routine.isActive = false;
        }
        
        // Activate the selected routine
        const routine = mockRoutines.find(r => r.id === id);
        if (!routine) {
          reject(new Error('Routine not found'));
          return;
        }
        
        routine.isActive = true;
        resolve();
      }, 300);
    });
  },

  // Delete routine
  deleteRoutine: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockRoutines.findIndex(r => r.id === id);
        if (index === -1) {
          reject(new Error('Routine not found'));
          return;
        }

        mockRoutines.splice(index, 1);
        resolve();
      }, 300);
    });
  },

  // Get exercises database
  getExercisesDatabase: (): Promise<typeof exercisesDatabase> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(exercisesDatabase), 200);
    });
  },

  // Search exercises
  searchExercises: (query: string, muscle?: string): Promise<typeof exercisesDatabase> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = exercisesDatabase;
        
        if (muscle && muscle !== 'all') {
          filtered = filtered.filter(ex => ex.muscle.toLowerCase() === muscle.toLowerCase());
        }
        
        if (query) {
          filtered = filtered.filter(ex => 
            ex.name.toLowerCase().includes(query.toLowerCase()) ||
            ex.muscle.toLowerCase().includes(query.toLowerCase()) ||
            ex.equipment.toLowerCase().includes(query.toLowerCase())
          );
        }
        
        resolve(filtered);
      }, 200);
    });
  },
};

export default routinesApi;