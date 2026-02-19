import { DayExercise, WeekDay } from '@/types';

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
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
    description: 'Rutina clásica de 6 días dividida por movimientos',
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
    id: 'full_body',
    name: 'Full Body',
    description: 'Rutina de cuerpo completo 3 días por semana',
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
  }
];

export const getTemplateById = (templateId: string): WorkoutTemplate | undefined => {
  return workoutTemplates.find(t => t.id === templateId);
};


