import { DayExercise, WeekDay } from '@/types';

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'endurance';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  days: WeekDay[];
  workouts: Record<WeekDay, {
    name: string;
    exercises: DayExercise[];
  }>;
}

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'push_pull_legs',
    name: 'Push/Pull/Legs',
    description: 'Rutina clásica de 6 días dividida por movimientos - Excelente para ganar masa muscular',
    goal: 'gain_muscle',
    difficulty: 'intermediate',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    workouts: {
      monday: {
        name: 'Push Day - Pecho, Hombros y Tríceps',
        exercises: [
          {
            id: 'ppl-mon-1',
            name: 'Press de Banca',
            muscle: 'Pecho',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ppl-mon-2',
            name: 'Incline Dumbbell Press',
            muscle: 'Pecho',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ppl-mon-3',
            name: 'Press Hombros',
            muscle: 'Hombros',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ppl-mon-4',
            name: 'Elevaciones Laterales',
            muscle: 'Hombros',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ppl-mon-5',
            name: 'Flexiones de Tríceps en Cuerda',
            muscle: 'Tríceps',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Polea',
          },
        ]
      },
      tuesday: {
        name: 'Pull Day - Espalda y Bíceps',
        exercises: [
          {
            id: 'ppl-tue-1',
            name: 'Dominadas',
            muscle: 'Espalda',
            sets: 4,
            reps: '8-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ppl-tue-2',
            name: 'Remo con Barra',
            muscle: 'Espalda',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ppl-tue-3',
            name: 'Jalón Frontal',
            muscle: 'Espalda',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Polea',
          },
          {
            id: 'ppl-tue-4',
            name: 'Curls con Barra',
            muscle: 'Bíceps',
            sets: 3,
            reps: '8-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ppl-tue-5',
            name: 'Curls Concentrados',
            muscle: 'Bíceps',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
        ]
      },
      wednesday: {
        name: 'Leg Day - Piernas Completo',
        exercises: [
          {
            id: 'ppl-wed-1',
            name: 'Sentadilla Back Squat',
            muscle: 'Cuádriceps',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ppl-wed-2',
            name: 'Peso Muerto Rumano',
            muscle: 'Femorales',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ppl-wed-3',
            name: 'Leg Press',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ppl-wed-4',
            name: 'Leg Curl',
            muscle: 'Femorales',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ppl-wed-5',
            name: 'Elevaciones de Pantorrillas',
            muscle: 'Pantorrillas',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Máquina',
          },
        ]
      },
      thursday: {
        name: 'Push Day - Pecho, Hombros y Tríceps',
        exercises: [
          {
            id: 'ppl-thu-1',
            name: 'Press Inclinado con Mancuernas',
            muscle: 'Pecho',
            sets: 4,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ppl-thu-2',
            name: 'Aperturas en Pectorales',
            muscle: 'Pecho',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Polea',
          },
          {
            id: 'ppl-thu-3',
            name: 'Elevaciones Frontales',
            muscle: 'Hombros',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ppl-thu-4',
            name: 'Press Hombros Máquina',
            muscle: 'Hombros',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ppl-thu-5',
            name: 'Tríceps Extensión Cabeza',
            muscle: 'Tríceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
        ]
      },
      friday: {
        name: 'Pull Day - Espalda y Bíceps',
        exercises: [
          {
            id: 'ppl-fri-1',
            name: 'Peso Muerto Convencional',
            muscle: 'Espalda',
            sets: 3,
            reps: '5-6',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ppl-fri-2',
            name: 'Remo Máquina',
            muscle: 'Espalda',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ppl-fri-3',
            name: 'Remo Invertido',
            muscle: 'Espalda',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ppl-fri-4',
            name: 'Curls Martillo',
            muscle: 'Bíceps',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ppl-fri-5',
            name: 'Curls en Cable',
            muscle: 'Bíceps',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Polea',
          },
        ]
      },
      saturday: {
        name: 'Leg Day - Piernas y Glúteos',
        exercises: [
          {
            id: 'ppl-sat-1',
            name: 'Front Squat',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ppl-sat-2',
            name: 'Hip Thrust',
            muscle: 'Glúteos',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ppl-sat-3',
            name: 'Prensa de Piernas',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ppl-sat-4',
            name: 'Extensión de Pierna',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ppl-sat-5',
            name: 'Sentadilla Búlgara',
            muscle: 'Glúteos',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
        ]
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  },
  {
    id: 'upper_lower',
    name: 'Upper/Lower Split',
    description: 'Rutina de 4 días alternando tren superior e inferior',
    days: ['monday', 'tuesday', 'thursday', 'friday'],
    workouts: {
      monday: {
        name: 'Upper Body - Tren Superior',
        exercises: [
          {
            id: 'ul-mon-1',
            name: 'Press de Banca',
            muscle: 'Pecho',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-mon-2',
            name: 'Remo con Barra',
            muscle: 'Espalda',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-mon-3',
            name: 'Press Hombros',
            muscle: 'Hombros',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-mon-4',
            name: 'Curls con Barra',
            muscle: 'Bíceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-mon-5',
            name: 'Extensión de Tríceps',
            muscle: 'Tríceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
        ]
      },
      tuesday: {
        name: 'Lower Body - Tren Inferior',
        exercises: [
          {
            id: 'ul-tue-1',
            name: 'Sentadilla Back Squat',
            muscle: 'Cuádriceps',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-tue-2',
            name: 'Peso Muerto Rumano',
            muscle: 'Femorales',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-tue-3',
            name: 'Leg Press',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ul-tue-4',
            name: 'Leg Curl',
            muscle: 'Femorales',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ul-tue-5',
            name: 'Elevaciones de Pantorrillas',
            muscle: 'Pantorrillas',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Máquina',
          },
        ]
      },
      wednesday: {
        name: 'Descanso',
        exercises: []
      },
      thursday: {
        name: 'Upper Body - Tren Superior',
        exercises: [
          {
            id: 'ul-thu-1',
            name: 'Dominadas',
            muscle: 'Espalda',
            sets: 3,
            reps: '8-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-thu-2',
            name: 'Incline Dumbbell Press',
            muscle: 'Pecho',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ul-thu-3',
            name: 'Elevaciones Laterales',
            muscle: 'Hombros',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ul-thu-4',
            name: 'Curls Martillo',
            muscle: 'Bíceps',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ul-thu-5',
            name: 'Flexiones de Tríceps en Cuerda',
            muscle: 'Tríceps',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Polea',
          },
        ]
      },
      friday: {
        name: 'Lower Body - Tren Inferior',
        exercises: [
          {
            id: 'ul-fri-1',
            name: 'Front Squat',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-fri-2',
            name: 'Hip Thrust',
            muscle: 'Glúteos',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-fri-3',
            name: 'Extensión de Pierna',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ul-fri-4',
            name: 'Sentadilla Búlgara',
            muscle: 'Glúteos',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ul-fri-5',
            name: 'Estiramiento de Pantorrillas',
            muscle: 'Pantorrillas',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Máquina',
          },
        ]
      },
      saturday: {
        name: 'Descanso',
        exercises: []
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  },
  {
    id: 'fat_loss_circuit',
    name: 'Entrenamiento para Pérdida de Grasa',
    description: 'Rutina de circuitos con alta intensidad - Optimal para quemar calorías',
    goal: 'lose_weight',
    difficulty: 'intermediate',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workouts: {
      monday: {
        name: 'HIIT Upper Body',
        exercises: [
          {
            id: 'fat-mon-1',
            name: 'Press de Pecho',
            muscle: 'Pecho',
            sets: 4,
            reps: '12-15',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fat-mon-2',
            name: 'Remo Barra',
            muscle: 'Espalda',
            sets: 4,
            reps: '12-15',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fat-mon-3',
            name: 'Flexiones',
            muscle: 'Pecho',
            sets: 3,
            reps: '12-20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'fat-mon-4',
            name: 'Dominadas',
            muscle: 'Espalda',
            sets: 3,
            reps: '8-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fat-mon-5',
            name: 'Burpees',
            muscle: 'Full Body',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      tuesday: {
        name: 'HIIT Lower Body',
        exercises: [
          {
            id: 'fat-tue-1',
            name: 'Sentadillas',
            muscle: 'Piernas',
            sets: 4,
            reps: '12-15',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fat-tue-2',
            name: 'Peso Muerto',
            muscle: 'Caderas',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fat-tue-3',
            name: 'Saltos al Cajón',
            muscle: 'Piernas',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Cajón',
          },
          {
            id: 'fat-tue-4',
            name: 'Sentadillas Divididas',
            muscle: 'Piernas',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'fat-tue-5',
            name: 'Montañeros',
            muscle: 'Core',
            sets: 3,
            reps: '20-30',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      wednesday: {
        name: 'Circuito Mixto Cardio',
        exercises: [
          {
            id: 'fat-wed-1',
            name: 'Saltos con Cuerda',
            muscle: 'Cardio',
            sets: 4,
            reps: '60-90 seg',
            weight: undefined,
            equipment: 'Cuerda',
          },
          {
            id: 'fat-wed-2',
            name: 'Kettlebell Swings',
            muscle: 'Full Body',
            sets: 4,
            reps: '15-20',
            weight: undefined,
            equipment: 'Kettlebell',
          },
          {
            id: 'fat-wed-3',
            name: 'Tabata Press',
            muscle: 'Hombros',
            sets: 4,
            reps: '20/10',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'fat-wed-4',
            name: 'Battle Ropes',
            muscle: 'Cardio',
            sets: 3,
            reps: '30-45 seg',
            weight: undefined,
            equipment: 'Cuerdas',
          },
        ]
      },
      thursday: {
        name: 'Entrenamiento Full Body',
        exercises: [
          {
            id: 'fat-thu-1',
            name: 'Sentadillas',
            muscle: 'Piernas',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fat-thu-2',
            name: 'Press de Pecho',
            muscle: 'Pecho',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fat-thu-3',
            name: 'Remo Barra',
            muscle: 'Espalda',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fat-thu-4',
            name: 'Face Pulls',
            muscle: 'Hombros',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Cable',
          },
          {
            id: 'fat-thu-5',
            name: 'Sprint en Caminadora',
            muscle: 'Cardio',
            sets: 5,
            reps: '30 seg',
            weight: undefined,
            equipment: 'Caminadora',
          },
        ]
      },
      friday: {
        name: 'Condicionamiento',
        exercises: [
          {
            id: 'fat-fri-1',
            name: 'Flexiones',
            muscle: 'Pecho',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'fat-fri-2',
            name: 'Sentadillas Corporales',
            muscle: 'Piernas',
            sets: 3,
            reps: '20-30',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'fat-fri-3',
            name: 'Planchas',
            muscle: 'Core',
            sets: 3,
            reps: '45-60 seg',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'fat-fri-4',
            name: 'Jumping Jacks',
            muscle: 'Cardio',
            sets: 3,
            reps: '30',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'fat-fri-5',
            name: 'Tricep Dips',
            muscle: 'Tríceps',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Banco',
          },
        ]
      },
      saturday: {
        name: 'Descanso',
        exercises: []
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  },
  {
    id: 'full_body',
    name: 'Full Body',
    description: 'Rutina de cuerpo completo 3 días por semana - Ideal para mantener o definir',
    goal: 'maintain',
    difficulty: 'beginner',
    days: ['monday', 'wednesday', 'friday'],
    workouts: {
      monday: {
        name: 'Full Body A',
        exercises: [
          {
            id: 'fb-mon-1',
            name: 'Press de Banca',
            muscle: 'Pecho',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb-mon-2',
            name: 'Remo con Barra',
            muscle: 'Espalda',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb-mon-3',
            name: 'Sentadilla Back Squat',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb-mon-4',
            name: 'Peso Muerto Rumano',
            muscle: 'Femorales',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb-mon-5',
            name: 'Flexiones de Tríceps en Cuerda',
            muscle: 'Tríceps',
            sets: 2,
            reps: '12-15',
            weight: undefined,
            equipment: 'Polea',
          },
        ]
      },
      tuesday: {
        name: 'Descanso',
        exercises: []
      },
      wednesday: {
        name: 'Full Body B',
        exercises: [
          {
            id: 'fb-wed-1',
            name: 'Incline Dumbbell Press',
            muscle: 'Pecho',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'fb-wed-2',
            name: 'Dominadas',
            muscle: 'Espalda',
            sets: 3,
            reps: '8-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb-wed-3',
            name: 'Front Squat',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb-wed-4',
            name: 'Hip Thrust',
            muscle: 'Glúteos',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb-wed-5',
            name: 'Curls con Barra',
            muscle: 'Bíceps',
            sets: 2,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
        ]
      },
      thursday: {
        name: 'Descanso',
        exercises: []
      },
      friday: {
        name: 'Full Body C',
        exercises: [
          {
            id: 'fb-fri-1',
            name: 'Press Hombros',
            muscle: 'Hombros',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb-fri-2',
            name: 'Remo Máquina',
            muscle: 'Espalda',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'fb-fri-3',
            name: 'Leg Press',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'fb-fri-4',
            name: 'Leg Curl',
            muscle: 'Femorales',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'fb-fri-5',
            name: 'Curls Martillo',
            muscle: 'Bíceps',
            sets: 2,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
        ]
      },
      saturday: {
        name: 'Descanso',
        exercises: []
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  },
  {
    id: 'endurance_training',
    name: 'Entrenamiento de Resistencia',
    description: 'Rutina enfocada en mejorar resistencia cardiovascular y muscular',
    goal: 'endurance',
    difficulty: 'advanced',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    workouts: {
      monday: {
        name: 'Carrera Larga + Fuerza',
        exercises: [
          {
            id: 'end-mon-1',
            name: 'Carrera Moderada',
            muscle: 'Cardio',
            sets: 1,
            reps: '45-60 min',
            weight: undefined,
            equipment: 'Calle/Caminadora',
          },
          {
            id: 'end-mon-2',
            name: 'Sentadillas',
            muscle: 'Piernas',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'end-mon-3',
            name: 'Peso Muerto Rumano',
            muscle: 'Caderas',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'end-mon-4',
            name: 'Extensiones de Piernas',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Máquina',
          },
        ]
      },
      tuesday: {
        name: 'Intervalos + Upper Body',
        exercises: [
          {
            id: 'end-tue-1',
            name: 'Sprints en Caminadora',
            muscle: 'Cardio',
            sets: 8,
            reps: '30 seg / 1 min',
            weight: undefined,
            equipment: 'Caminadora',
          },
          {
            id: 'end-tue-2',
            name: 'Press de Banca',
            muscle: 'Pecho',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'end-tue-3',
            name: 'Remo Barra',
            muscle: 'Espalda',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'end-tue-4',
            name: 'Press Militar',
            muscle: 'Hombros',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'end-tue-5',
            name: 'Remo Mancuerna',
            muscle: 'Espalda',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
        ]
      },
      wednesday: {
        name: 'Ciclismo o Natación',
        exercises: [
          {
            id: 'end-wed-1',
            name: 'Ciclismo Moderado',
            muscle: 'Cardio',
            sets: 1,
            reps: '60-90 min',
            weight: undefined,
            equipment: 'Bicicleta',
          },
          {
            id: 'end-wed-2',
            name: 'Core Trabajo',
            muscle: 'Core',
            sets: 3,
            reps: '20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'end-wed-3',
            name: 'Flexiones',
            muscle: 'Pecho',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      thursday: {
        name: 'Entrenamiento Fuerza Pura',
        exercises: [
          {
            id: 'end-thu-1',
            name: 'Sentadillas Pesadas',
            muscle: 'Piernas',
            sets: 5,
            reps: '3-5',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'end-thu-2',
            name: 'Peso Muerto Pesado',
            muscle: 'Caderas',
            sets: 5,
            reps: '3-5',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'end-thu-3',
            name: 'Press de Banca Pesado',
            muscle: 'Pecho',
            sets: 5,
            reps: '3-5',
            weight: undefined,
            equipment: 'Barra',
          },
        ]
      },
      friday: {
        name: 'Cross Training',
        exercises: [
          {
            id: 'end-fri-1',
            name: 'Remo en Máquina',
            muscle: 'Cardio',
            sets: 4,
            reps: '15-20 min',
            weight: undefined,
            equipment: 'Máquina Remo',
          },
          {
            id: 'end-fri-2',
            name: 'Burpees',
            muscle: 'Full Body',
            sets: 4,
            reps: '15',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'end-fri-3',
            name: 'Box Jumps',
            muscle: 'Piernas',
            sets: 4,
            reps: '10',
            weight: undefined,
            equipment: 'Cajón',
          },
          {
            id: 'end-fri-4',
            name: 'Planchas Largas',
            muscle: 'Core',
            sets: 3,
            reps: '60-90 seg',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      saturday: {
        name: 'Carrera o Trote  Recuperación',
        exercises: [
          {
            id: 'end-sat-1',
            name: 'Carrera Fácil/Trote',
            muscle: 'Cardio',
            sets: 1,
            reps: '30-45 min',
            weight: undefined,
            equipment: 'Calle/Caminadora',
          },
          {
            id: 'end-sat-2',
            name: 'Estiramientos',
            muscle: 'Flexibilidad',
            sets: 1,
            reps: '15-20 min',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  },
  {
    id: 'upper_lower_split',
    name: 'Upper/Lower Split',
    description: 'Rutina de 4 días alternando tren superior e inferior - Perfecto para hipertrofia',
    goal: 'gain_muscle',
    difficulty: 'intermediate',
    days: ['monday', 'tuesday', 'thursday', 'friday'],
    workouts: {
      monday: {
        name: 'Upper Body A',
        exercises: [
          {
            id: 'ul-mon-1',
            name: 'Press de Banca',
            muscle: 'Pecho',
            sets: 4,
            reps: '6-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-mon-2',
            name: 'Remo Barra',
            muscle: 'Espalda',
            sets: 4,
            reps: '6-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-mon-3',
            name: 'Press Inclinado',
            muscle: 'Pecho',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ul-mon-4',
            name: 'Jalón Lateral',
            muscle: 'Espalda',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Cable',
          },
          {
            id: 'ul-mon-5',
            name: 'Face Pulls',
            muscle: 'Hombros',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Cable',
          },
        ]
      },
      tuesday: {
        name: 'Lower Body A',
        exercises: [
          {
            id: 'ul-tue-1',
            name: 'Sentadillas Pesadas',
            muscle: 'Piernas',
            sets: 4,
            reps: '6-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-tue-2',
            name: 'Peso Muerto',
            muscle: 'Caderas',
            sets: 4,
            reps: '6-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-tue-3',
            name: 'Prensa de Piernas',
            muscle: 'Piernas',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ul-tue-4',
            name: 'Flexiones de Piernas',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ul-tue-5',
            name: 'Curl de Piernas',
            muscle: 'Isquiotibiales',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
        ]
      },
      wednesday: {
        name: 'Descanso',
        exercises: []
      },
      thursday: {
        name: 'Upper Body B',
        exercises: [
          {
            id: 'ul-thu-1',
            name: 'Press Militar',
            muscle: 'Hombros',
            sets: 4,
            reps: '6-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-thu-2',
            name: 'Remo Mancuerna',
            muscle: 'Espalda',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ul-thu-3',
            name: 'Aperturas en Banco',
            muscle: 'Pecho',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'ul-thu-4',
            name: 'Curl Bíceps',
            muscle: 'Bíceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-thu-5',
            name: 'Extensión Tríceps',
            muscle: 'Tríceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Cable',
          },
        ]
      },
      friday: {
        name: 'Lower Body B',
        exercises: [
          {
            id: 'ul-fri-1',
            name: 'Sentadilla Frontal',
            muscle: 'Piernas',
            sets: 4,
            reps: '6-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-fri-2',
            name: 'Peso Muerto Rumano',
            muscle: 'Caderas',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'ul-fri-3',
            name: 'Extensiones de Cuádriceps',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ul-fri-4',
            name: 'Curl Isquiotibiales',
            muscle: 'Isquiotibiales',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'ul-fri-5',
            name: 'Pantorrilla Máquina',
            muscle: 'Pantorrillas',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Máquina',
          },
        ]
      },
      saturday: {
        name: 'Descanso',
        exercises: []
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  },
  {
    id: 'hypertrophy_4day',
    name: 'Hypertrophy 4-Day',
    description: 'Rutina enfocada en hipertrofia muscular con volumen alto - 4 días de entrenamiento',
    goal: 'gain_muscle',
    difficulty: 'advanced',
    days: ['monday', 'tuesday', 'thursday', 'friday'],
    workouts: {
      monday: {
        name: 'Pecho + Tríceps',
        exercises: [
          {
            id: 'hyp-mon-1',
            name: 'Press de Banca',
            muscle: 'Pecho',
            sets: 4,
            reps: '6-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'hyp-mon-2',
            name: 'Press Inclinado Mancuernas',
            muscle: 'Pecho',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'hyp-mon-3',
            name: 'Aperturas en Pecho',
            muscle: 'Pecho',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'hyp-mon-4',
            name: 'Dips en Banco',
            muscle: 'Tríceps',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Banco',
          },
          {
            id: 'hyp-mon-5',
            name: 'Presión de Tríceps',
            muscle: 'Tríceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Cable',
          },
        ]
      },
      tuesday: {
        name: 'Espalda + Bíceps',
        exercises: [
          {
            id: 'hyp-tue-1',
            name: 'Remo Barra Pesado',
            muscle: 'Espalda',
            sets: 4,
            reps: '6-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'hyp-tue-2',
            name: 'Remo Mancuerna',
            muscle: 'Espalda',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'hyp-tue-3',
            name: 'Jalón Lateral',
            muscle: 'Espalda',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Cable',
          },
          {
            id: 'hyp-tue-4',
            name: 'Curl Bíceps',
            muscle: 'Bíceps',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'hyp-tue-5',
            name: 'Curl Martillo',
            muscle: 'Bíceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
        ]
      },
      wednesday: {
        name: 'Descanso',
        exercises: []
      },
      thursday: {
        name: 'Piernas',
        exercises: [
          {
            id: 'hyp-thu-1',
            name: 'Sentadillas',
            muscle: 'Piernas',
            sets: 5,
            reps: '6-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'hyp-thu-2',
            name: 'Prensa de Piernas',
            muscle: 'Piernas',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'hyp-thu-3',
            name: 'Flexiones de Piernas',
            muscle: 'Cuádriceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'hyp-thu-4',
            name: 'Peso Muerto Rumano',
            muscle: 'Caderas',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'hyp-thu-5',
            name: 'Curl Piernas',
            muscle: 'Isquiotibiales',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Máquina',
          },
        ]
      },
      friday: {
        name: 'Hombros + Accesorios',
        exercises: [
          {
            id: 'hyp-fri-1',
            name: 'Press Militar',
            muscle: 'Hombros',
            sets: 4,
            reps: '6-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'hyp-fri-2',
            name: 'Elevaciones Laterales',
            muscle: 'Hombros',
            sets: 4,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'hyp-fri-3',
            name: 'Elevaciones Frontales',
            muscle: 'Hombros',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'hyp-fri-4',
            name: 'Shrugs',
            muscle: 'Trampecio',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'hyp-fri-5',
            name: 'Planchas Abdominales',
            muscle: 'Core',
            sets: 3,
            reps: '45-60 seg',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      saturday: {
        name: 'Descanso',
        exercises: []
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  },
  {
    id: 'full_body_4day',
    name: 'Full Body 4-Day',
    description: 'Rutina full body de 4 días - Excelente para definición y fuerza',
    goal: 'maintain',
    difficulty: 'intermediate',
    days: ['monday', 'wednesday', 'thursday', 'saturday'],
    workouts: {
      monday: {
        name: 'Full Body A - Piernas',
        exercises: [
          {
            id: 'fb4-mon-1',
            name: 'Sentadillas',
            muscle: 'Piernas',
            sets: 4,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb4-mon-2',
            name: 'Press de Banca',
            muscle: 'Pecho',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb4-mon-3',
            name: 'Remo Barra',
            muscle: 'Espalda',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb4-mon-4',
            name: 'Curl Bíceps',
            muscle: 'Bíceps',
            sets: 2,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb4-mon-5',
            name: 'Extensión Tríceps',
            muscle: 'Tríceps',
            sets: 2,
            reps: '10-12',
            weight: undefined,
            equipment: 'Cable',
          },
        ]
      },
      tuesday: {
        name: 'Descanso',
        exercises: []
      },
      wednesday: {
        name: 'Full Body B - Espalda',
        exercises: [
          {
            id: 'fb4-wed-1',
            name: 'Peso Muerto',
            muscle: 'Caderas',
            sets: 4,
            reps: '6-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb4-wed-2',
            name: 'Press Inclinado',
            muscle: 'Pecho',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'fb4-wed-3',
            name: 'Jalón Lateral',
            muscle: 'Espalda',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Cable',
          },
          {
            id: 'fb4-wed-4',
            name: 'Press Militar',
            muscle: 'Hombros',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb4-wed-5',
            name: 'Face Pulls',
            muscle: 'Hombros',
            sets: 2,
            reps: '12-15',
            weight: undefined,
            equipment: 'Cable',
          },
        ]
      },
      thursday: {
        name: 'Full Body C - Ligero',
        exercises: [
          {
            id: 'fb4-thu-1',
            name: 'Sentadilla Frontal',
            muscle: 'Piernas',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb4-thu-2',
            name: 'Aperturas en Pecho',
            muscle: 'Pecho',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'fb4-thu-3',
            name: 'Remo Mancuerna',
            muscle: 'Espalda',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'fb4-thu-4',
            name: 'Elevaciones Laterales',
            muscle: 'Hombros',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'fb4-thu-5',
            name: 'Curl Martillo',
            muscle: 'Bíceps',
            sets: 2,
            reps: '10-12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
        ]
      },
      friday: {
        name: 'Descanso',
        exercises: []
      },
      saturday: {
        name: 'Full Body D - Cardio',
        exercises: [
          {
            id: 'fb4-sat-1',
            name: 'Trote Ligero',
            muscle: 'Cardio',
            sets: 1,
            reps: '20-30 min',
            weight: undefined,
            equipment: 'Caminadora',
          },
          {
            id: 'fb4-sat-2',
            name: 'Flexiones',
            muscle: 'Pecho',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'fb4-sat-3',
            name: 'Dominadas',
            muscle: 'Espalda',
            sets: 3,
            reps: '8-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'fb4-sat-4',
            name: 'Sentadillas Corporales',
            muscle: 'Piernas',
            sets: 3,
            reps: '20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'fb4-sat-5',
            name: 'Planchas',
            muscle: 'Core',
            sets: 3,
            reps: '45-60 seg',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  },
  {
    id: 'balanced_weekly',
    name: 'Balanced Weekly',
    description: 'Rutina equilibrada para mantener forma y salud general - 5 días',
    goal: 'maintain',
    difficulty: 'beginner',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workouts: {
      monday: {
        name: 'Pecho y Espalda',
        exercises: [
          {
            id: 'bal-mon-1',
            name: 'Press de Banca',
            muscle: 'Pecho',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'bal-mon-2',
            name: 'Remo Barra',
            muscle: 'Espalda',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'bal-mon-3',
            name: 'Aperturas en Pecho',
            muscle: 'Pecho',
            sets: 2,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'bal-mon-4',
            name: 'Jalón Lateral',
            muscle: 'Espalda',
            sets: 2,
            reps: '12-15',
            weight: undefined,
            equipment: 'Cable',
          },
        ]
      },
      tuesday: {
        name: 'Piernas',
        exercises: [
          {
            id: 'bal-tue-1',
            name: 'Sentadillas',
            muscle: 'Piernas',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'bal-tue-2',
            name: 'Peso Muerto',
            muscle: 'Caderas',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'bal-tue-3',
            name: 'Extensión de Cuádriceps',
            muscle: 'Cuádriceps',
            sets: 2,
            reps: '12-15',
            weight: undefined,
            equipment: 'Máquina',
          },
          {
            id: 'bal-tue-4',
            name: 'Curl de Piernas',
            muscle: 'Isquiotibiales',
            sets: 2,
            reps: '12-15',
            weight: undefined,
            equipment: 'Máquina',
          },
        ]
      },
      wednesday: {
        name: 'Cardio y Core',
        exercises: [
          {
            id: 'bal-wed-1',
            name: 'Trote',
            muscle: 'Cardio',
            sets: 1,
            reps: '30-45 min',
            weight: undefined,
            equipment: 'Caminadora',
          },
          {
            id: 'bal-wed-2',
            name: 'Planchas',
            muscle: 'Core',
            sets: 3,
            reps: '45-60 seg',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'bal-wed-3',
            name: 'Crunches',
            muscle: 'Abdominales',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'bal-wed-4',
            name: 'Mountain Climbers',
            muscle: 'Core',
            sets: 3,
            reps: '20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      thursday: {
        name: 'Hombros y Brazos',
        exercises: [
          {
            id: 'bal-thu-1',
            name: 'Press Militar',
            muscle: 'Hombros',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'bal-thu-2',
            name: 'Curl Bíceps',
            muscle: 'Bíceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'bal-thu-3',
            name: 'Extensión Tríceps',
            muscle: 'Tríceps',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Cable',
          },
          {
            id: 'bal-thu-4',
            name: 'Elevaciones Laterales',
            muscle: 'Hombros',
            sets: 2,
            reps: '12-15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
        ]
      },
      friday: {
        name: 'Full Body Ligero',
        exercises: [
          {
            id: 'bal-fri-1',
            name: 'Flexiones',
            muscle: 'Pecho',
            sets: 3,
            reps: '12-15',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'bal-fri-2',
            name: 'Dominadas',
            muscle: 'Espalda',
            sets: 3,
            reps: '8-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'bal-fri-3',
            name: 'Sentadillas Corporales',
            muscle: 'Piernas',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'bal-fri-4',
            name: 'Burpees',
            muscle: 'Full Body',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      saturday: {
        name: 'Descanso',
        exercises: []
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  },
  {
    id: 'hiit_cardio_focus',
    name: 'HIIT Cardio Focus',
    description: 'Rutina con énfasis en cardio de alta intensidad y quemagrasas',
    goal: 'lose_weight',
    difficulty: 'advanced',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workouts: {
      monday: {
        name: 'Sprints + Upper Body Ligero',
        exercises: [
          {
            id: 'hiit-mon-1',
            name: 'Sprints 8x30seg',
            muscle: 'Cardio',
            sets: 8,
            reps: '30 seg / 30 seg',
            weight: undefined,
            equipment: 'Caminadora',
          },
          {
            id: 'hiit-mon-2',
            name: 'Flexiones',
            muscle: 'Pecho',
            sets: 3,
            reps: '15-20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'hiit-mon-3',
            name: 'Remo Mancuerna',
            muscle: 'Espalda',
            sets: 3,
            reps: '15',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'hiit-mon-4',
            name: 'Curl Bíceps Rápido',
            muscle: 'Bíceps',
            sets: 3,
            reps: '12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
        ]
      },
      tuesday: {
        name: 'Jump Circuit',
        exercises: [
          {
            id: 'hiit-tue-1',
            name: 'Burpees',
            muscle: 'Full Body',
            sets: 5,
            reps: '12',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'hiit-tue-2',
            name: 'Box Jumps',
            muscle: 'Piernas',
            sets: 5,
            reps: '10',
            weight: undefined,
            equipment: 'Cajón',
          },
          {
            id: 'hiit-tue-3',
            name: 'Mountain Climbers',
            muscle: 'Core',
            sets: 5,
            reps: '20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'hiit-tue-4',
            name: 'Jumping Jacks',
            muscle: 'Cardio',
            sets: 5,
            reps: '30',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      wednesday: {
        name: 'Rowing + Legs',
        exercises: [
          {
            id: 'hiit-wed-1',
            name: 'Remo Máquina 20min',
            muscle: 'Cardio',
            sets: 1,
            reps: '20 min',
            weight: undefined,
            equipment: 'Máquina Remo',
          },
          {
            id: 'hiit-wed-2',
            name: 'Sentadillas Rápidas',
            muscle: 'Piernas',
            sets: 4,
            reps: '15',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'hiit-wed-3',
            name: 'Estocadas Alternas',
            muscle: 'Piernas',
            sets: 3,
            reps: '20',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'hiit-wed-4',
            name: 'Saltos con Cuerda',
            muscle: 'Cardio',
            sets: 5,
            reps: '60 seg',
            weight: undefined,
            equipment: 'Cuerda',
          },
        ]
      },
      thursday: {
        name: 'Battle Ropes y Core',
        exercises: [
          {
            id: 'hiit-thu-1',
            name: 'Battle Ropes',
            muscle: 'Full Body',
            sets: 6,
            reps: '45 seg / 15 seg',
            weight: undefined,
            equipment: 'Cuerdas',
          },
          {
            id: 'hiit-thu-2',
            name: 'Planchas Dinámicas',
            muscle: 'Core',
            sets: 4,
            reps: '30 seg',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'hiit-thu-3',
            name: 'V-ups',
            muscle: 'Abdominales',
            sets: 3,
            reps: '15',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'hiit-thu-4',
            name: 'Kettlebell Swings Rápido',
            muscle: 'Full Body',
            sets: 4,
            reps: '20',
            weight: undefined,
            equipment: 'Kettlebell',
          },
        ]
      },
      friday: {
        name: 'Mixed Cardio Finisher',
        exercises: [
          {
            id: 'hiit-fri-1',
            name: 'Ciclismo Intenso',
            muscle: 'Cardio',
            sets: 1,
            reps: '25 min',
            weight: undefined,
            equipment: 'Bicicleta',
          },
          {
            id: 'hiit-fri-2',
            name: 'Tabata Press',
            muscle: 'Hombros',
            sets: 4,
            reps: '20/10',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'hiit-fri-3',
            name: 'Sentadilla + Salto',
            muscle: 'Piernas',
            sets: 4,
            reps: '12',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'hiit-fri-4',
            name: 'Jump Rope Rápido',
            muscle: 'Cardio',
            sets: 5,
            reps: '90 seg',
            weight: undefined,
            equipment: 'Cuerda',
          },
        ]
      },
      saturday: {
        name: 'Descanso',
        exercises: []
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  },
  {
    id: 'circuit_bootcamp',
    name: 'Circuit Training Bootcamp',
    description: 'Entrenamiento de circuito intenso combinando fuerza y cardio',
    goal: 'lose_weight',
    difficulty: 'intermediate',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workouts: {
      monday: {
        name: 'Upper Body Circuit',
        exercises: [
          {
            id: 'circ-mon-1',
            name: 'Press de Pecho',
            muscle: 'Pecho',
            sets: 3,
            reps: '12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'circ-mon-2',
            name: 'Remo Barra',
            muscle: 'Espalda',
            sets: 3,
            reps: '12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'circ-mon-3',
            name: 'Flexiones',
            muscle: 'Pecho',
            sets: 3,
            reps: '15',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'circ-mon-4',
            name: 'Dominadas',
            muscle: 'Espalda',
            sets: 3,
            reps: '10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'circ-mon-5',
            name: 'Combate de Cuerdas',
            muscle: 'Cardio',
            sets: 3,
            reps: '30 seg',
            weight: undefined,
            equipment: 'Cuerdas',
          },
        ]
      },
      tuesday: {
        name: 'Lower Body Circuit',
        exercises: [
          {
            id: 'circ-tue-1',
            name: 'Sentadillas',
            muscle: 'Piernas',
            sets: 3,
            reps: '15',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'circ-tue-2',
            name: 'Peso Muerto',
            muscle: 'Caderas',
            sets: 3,
            reps: '12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'circ-tue-3',
            name: 'Estocadas',
            muscle: 'Piernas',
            sets: 3,
            reps: '12',
            weight: undefined,
            equipment: 'Mancuernas',
          },
          {
            id: 'circ-tue-4',
            name: 'Saltos al Cajón',
            muscle: 'Piernas',
            sets: 3,
            reps: '10',
            weight: undefined,
            equipment: 'Cajón',
          },
          {
            id: 'circ-tue-5',
            name: 'Sprint en Lugar',
            muscle: 'Cardio',
            sets: 3,
            reps: '30 seg',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      wednesday: {
        name: 'Full Body Intense',
        exercises: [
          {
            id: 'circ-wed-1',
            name: 'Burpees',
            muscle: 'Full Body',
            sets: 4,
            reps: '12',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'circ-wed-2',
            name: 'Kettlebell Swings',
            muscle: 'Full Body',
            sets: 4,
            reps: '15',
            weight: undefined,
            equipment: 'Kettlebell',
          },
          {
            id: 'circ-wed-3',
            name: 'Mountain Climbers',
            muscle: 'Core',
            sets: 4,
            reps: '20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'circ-wed-4',
            name: 'Push Up Rápido',
            muscle: 'Pecho',
            sets: 3,
            reps: '20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'circ-wed-5',
            name: 'Jumping Jacks',
            muscle: 'Cardio',
            sets: 3,
            reps: '40',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      thursday: {
        name: 'Cardio Mixto',
        exercises: [
          {
            id: 'circ-thu-1',
            name: 'Trote/Caminadora',
            muscle: 'Cardio',
            sets: 1,
            reps: '20 min',
            weight: undefined,
            equipment: 'Caminadora',
          },
          {
            id: 'circ-thu-2',
            name: 'Cuerdas de Salto',
            muscle: 'Cardio',
            sets: 5,
            reps: '60 seg',
            weight: undefined,
            equipment: 'Cuerda',
          },
          {
            id: 'circ-thu-3',
            name: 'High Knees',
            muscle: 'Cardio',
            sets: 4,
            reps: '45 seg',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'circ-thu-4',
            name: 'Burpees Ligeros',
            muscle: 'Full Body',
            sets: 3,
            reps: '10',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      friday: {
        name: 'Final Circuit Challenge',
        exercises: [
          {
            id: 'circ-fri-1',
            name: 'Sentadillas + Salto',
            muscle: 'Piernas',
            sets: 4,
            reps: '10',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'circ-fri-2',
            name: 'Flexiones + Rodilla',
            muscle: 'Pecho',
            sets: 4,
            reps: '12',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'circ-fri-3',
            name: 'Planchas Laterales',
            muscle: 'Core',
            sets: 3,
            reps: '45 seg',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'circ-fri-4',
            name: 'V-ups',
            muscle: 'Abdominales',
            sets: 3,
            reps: '15',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'circ-fri-5',
            name: 'Descanso Activo',
            muscle: 'Cardio',
            sets: 1,
            reps: '10 min',
            weight: undefined,
            equipment: 'Caminadora',
          },
        ]
      },
      saturday: {
        name: 'Descanso',
        exercises: []
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  },
  {
    id: 'marathon_training',
    name: 'Marathon Training',
    description: 'Programa de entrenamiento para maratón con fuerza complementaria',
    goal: 'endurance',
    difficulty: 'advanced',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    workouts: {
      monday: {
        name: 'Fuerza Piernas + Cardio',
        exercises: [
          {
            id: 'mar-mon-1',
            name: 'Sentadillas',
            muscle: 'Piernas',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'mar-mon-2',
            name: 'Peso Muerto',
            muscle: 'Caderas',
            sets: 3,
            reps: '8-10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'mar-mon-3',
            name: 'Carrera Fácil',
            muscle: 'Cardio',
            sets: 1,
            reps: '30 min',
            weight: undefined,
            equipment: 'Calle',
          },
        ]
      },
      tuesday: {
        name: 'Carrera Velocidad',
        exercises: [
          {
            id: 'mar-tue-1',
            name: 'Calentamiento Trote',
            muscle: 'Cardio',
            sets: 1,
            reps: '10 min',
            weight: undefined,
            equipment: 'Calle',
          },
          {
            id: 'mar-tue-2',
            name: 'Sprints 8x400m',
            muscle: 'Cardio',
            sets: 8,
            reps: '400m / 200m',
            weight: undefined,
            equipment: 'Calle',
          },
          {
            id: 'mar-tue-3',
            name: 'Enfriamiento',
            muscle: 'Cardio',
            sets: 1,
            reps: '10 min',
            weight: undefined,
            equipment: 'Calle',
          },
        ]
      },
      wednesday: {
        name: 'Fuerza Upper + Flexibilidad',
        exercises: [
          {
            id: 'mar-wed-1',
            name: 'Press de Banca',
            muscle: 'Pecho',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'mar-wed-2',
            name: 'Remo Barra',
            muscle: 'Espalda',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'mar-wed-3',
            name: 'Estiramientos Largo',
            muscle: 'Flexibilidad',
            sets: 1,
            reps: '20 min',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      thursday: {
        name: 'Carrera Larga Moderada',
        exercises: [
          {
            id: 'mar-thu-1',
            name: 'Carrera Larga',
            muscle: 'Cardio',
            sets: 1,
            reps: '60-90 min',
            weight: undefined,
            equipment: 'Calle',
          },
          {
            id: 'mar-thu-2',
            name: 'Core Trabajo',
            muscle: 'Core',
            sets: 3,
            reps: '20',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      friday: {
        name: 'Recuperación Activa',
        exercises: [
          {
            id: 'mar-fri-1',
            name: 'Yoga o Pilates',
            muscle: 'Flexibilidad',
            sets: 1,
            reps: '30-45 min',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'mar-fri-2',
            name: 'Trote Muy Fácil',
            muscle: 'Cardio',
            sets: 1,
            reps: '20 min',
            weight: undefined,
            equipment: 'Calle',
          },
        ]
      },
      saturday: {
        name: 'Carrera Distancia Larga',
        exercises: [
          {
            id: 'mar-sat-1',
            name: 'Carrera Très Larga',
            muscle: 'Cardio',
            sets: 1,
            reps: '90+ min',
            weight: undefined,
            equipment: 'Calle',
          },
          {
            id: 'mar-sat-2',
            name: 'Recuperación Pasiva',
            muscle: 'Flexibilidad',
            sets: 1,
            reps: '15 min',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      sunday: {
        name: 'Descanso Completo',
        exercises: []
      }
    }
  },
  {
    id: 'functional_fitness',
    name: 'Functional Fitness',
    description: 'Entrenamiento funcional mejorando fuerza, movilidad y resistencia',
    goal: 'endurance',
    difficulty: 'intermediate',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workouts: {
      monday: {
        name: 'Movimientos Fundamentales',
        exercises: [
          {
            id: 'func-mon-1',
            name: 'Sentadillas Profundas',
            muscle: 'Piernas',
            sets: 5,
            reps: '5',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'func-mon-2',
            name: 'Levantamiento Pesas',
            muscle: 'Full Body',
            sets: 5,
            reps: '5',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'func-mon-3',
            name: 'Flexiones Escalonadas',
            muscle: 'Pecho',
            sets: 3,
            reps: '10-15',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      tuesday: {
        name: 'Metabolic Conditioning',
        exercises: [
          {
            id: 'func-tue-1',
            name: 'Burpees',
            muscle: 'Full Body',
            sets: 5,
            reps: '10',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'func-tue-2',
            name: 'Box Jumps',
            muscle: 'Piernas',
            sets: 5,
            reps: '8',
            weight: undefined,
            equipment: 'Cajón',
          },
          {
            id: 'func-tue-3',
            name: 'Kettlebell Swings',
            muscle: 'Caderas',
            sets: 5,
            reps: '15',
            weight: undefined,
            equipment: 'Kettlebell',
          },
          {
            id: 'func-tue-4',
            name: 'Remo Máquina',
            muscle: 'Cardio',
            sets: 1,
            reps: '5 min',
            weight: undefined,
            equipment: 'Máquina Remo',
          },
        ]
      },
      wednesday: {
        name: 'Movilidad y Fuerza Core',
        exercises: [
          {
            id: 'func-wed-1',
            name: 'Yoga Flow',
            muscle: 'Flexibilidad',
            sets: 1,
            reps: '30 min',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'func-wed-2',
            name: 'Planchas Dinámicas',
            muscle: 'Core',
            sets: 4,
            reps: '30-45 seg',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
          {
            id: 'func-wed-3',
            name: 'Hollow Body Holds',
            muscle: 'Core',
            sets: 3,
            reps: '20-30 seg',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      thursday: {
        name: 'Fuerza y Potencia',
        exercises: [
          {
            id: 'func-thu-1',
            name: 'Press de Hombros',
            muscle: 'Hombros',
            sets: 5,
            reps: '5',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'func-thu-2',
            name: 'Dominadas',
            muscle: 'Espalda',
            sets: 5,
            reps: '5-8',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'func-thu-3',
            name: 'Peso Muerto de Pierna',
            muscle: 'Caderas',
            sets: 3,
            reps: '10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'func-thu-4',
            name: 'Wall Ball Throws',
            muscle: 'Full Body',
            sets: 4,
            reps: '15',
            weight: undefined,
            equipment: 'Medicine Ball',
          },
        ]
      },
      friday: {
        name: 'WOD Mixed',
        exercises: [
          {
            id: 'func-fri-1',
            name: 'Complejo: Squat + Salto',
            muscle: 'Full Body',
            sets: 5,
            reps: '10',
            weight: undefined,
            equipment: 'Barra',
          },
          {
            id: 'func-fri-2',
            name: 'Circuito AMRAP 12min',
            muscle: 'Full Body',
            sets: 1,
            reps: '12 min',
            weight: undefined,
            equipment: 'Mixed',
          },
          {
            id: 'func-fri-3',
            name: 'Enfriamiento Activo',
            muscle: 'Flexibilidad',
            sets: 1,
            reps: '10 min',
            weight: undefined,
            equipment: 'Peso Corporal',
          },
        ]
      },
      saturday: {
        name: 'Descanso',
        exercises: []
      },
      sunday: {
        name: 'Descanso',
        exercises: []
      }
    }
  }
];

export const getTemplateById = (templateId: string): WorkoutTemplate | undefined => {
  return workoutTemplates.find(t => t.id === templateId);
};

// Obtener templates filtrados por objetivo del usuario
export const getTemplatesByGoal = (goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'endurance'): WorkoutTemplate[] => {
  return workoutTemplates.filter(t => t.goal === goal);
};

// Obtener todos los templates disponibles (para admin/debug)
export const getAllTemplates = (): WorkoutTemplate[] => {
  return workoutTemplates;
};

// Obtener el template recomendado para un objetivo (el primero disponible)
export const getRecommendedTemplate = (goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'endurance'): WorkoutTemplate | undefined => {
  const templates = getTemplatesByGoal(goal);
  return templates.length > 0 ? templates[0] : undefined;
};


