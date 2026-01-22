import { Workout, Exercise, WorkoutSession } from '@/types';

// Mock workout data
const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Bench Press',
    muscle: 'Chest',
    equipment: 'Barbell',
    instructions: [
      'Lie on bench with feet firmly on ground',
      'Grip bar with hands wider than shoulders',
      'Lower bar to chest with control',
      'Press bar up until arms are extended',
      'Repeat for desired reps',
    ],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
  },
  {
    id: '2',
    name: 'Squats',
    muscle: 'Legs',
    equipment: 'Barbell',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep chest up and knees behind toes',
      'Lower until thighs are parallel to floor',
      'Push through heels to return to start',
    ],
    image: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=300&h=200&fit=crop',
  },
  {
    id: '3',
    name: 'Deadlift',
    muscle: 'Back',
    equipment: 'Barbell',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip bar',
      'Keep chest up and back neutral',
      'Drive through heels and hips to lift bar',
      'Stand tall, then lower with control',
    ],
    image: 'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=300&h=200&fit=crop',
  },
  {
    id: '4',
    name: 'Pull-ups',
    muscle: 'Back',
    equipment: 'Pull-up Bar',
    instructions: [
      'Hang from bar with arms fully extended',
      'Pull your body up until chin is over bar',
      'Lower yourself with control',
      'Repeat for desired reps',
    ],
    image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=300&h=200&fit=crop',
  },
];

const mockWorkouts: Workout[] = [
  {
    id: '1',
    name: 'Push Day',
    description: 'Chest, shoulders, and triceps workout',
    duration: 60,
    difficulty: 'intermediate',
    category: 'strength',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=200&fit=crop',
    exercises: [
      {
        id: '1',
        exercise: mockExercises[0],
        sets: [
          { id: '1', reps: 8, weight: 80, restTime: 120, completed: false },
          { id: '2', reps: 8, weight: 80, restTime: 120, completed: false },
          { id: '3', reps: 6, weight: 85, restTime: 120, completed: false },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Pull Day',
    description: 'Back and biceps focused workout',
    duration: 55,
    difficulty: 'intermediate',
    category: 'strength',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=200&fit=crop',
    exercises: [
      {
        id: '2',
        exercise: mockExercises[3],
        sets: [
          { id: '4', reps: 10, weight: 0, restTime: 90, completed: false },
          { id: '5', reps: 8, weight: 0, restTime: 90, completed: false },
          { id: '6', reps: 6, weight: 0, restTime: 90, completed: false },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Leg Day',
    description: 'Complete lower body workout',
    duration: 70,
    difficulty: 'advanced',
    category: 'strength',
    image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=300&h=200&fit=crop',
    exercises: [
      {
        id: '3',
        exercise: mockExercises[1],
        sets: [
          { id: '7', reps: 12, weight: 100, restTime: 180, completed: false },
          { id: '8', reps: 10, weight: 110, restTime: 180, completed: false },
          { id: '9', reps: 8, weight: 120, restTime: 180, completed: false },
        ],
      },
    ],
  },
  {
    id: '4',
    name: 'HIIT Cardio',
    description: 'High intensity interval training',
    duration: 30,
    difficulty: 'beginner',
    category: 'hiit',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
    exercises: [],
  },
];

// Workout API service
export const workoutApi = {
  async getWorkouts(): Promise<Workout[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockWorkouts;
  },

  async getWorkout(id: string): Promise<Workout | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockWorkouts.find(workout => workout.id === id) || null;
  },

  async getExercises(): Promise<Exercise[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockExercises;
  },

  async getExercise(id: string): Promise<Exercise | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockExercises.find(exercise => exercise.id === id) || null;
  },

  async getTodayWorkout(): Promise<Workout | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return a random workout as "today's workout"
    const randomIndex = Math.floor(Math.random() * mockWorkouts.length);
    return mockWorkouts[randomIndex];
  },

  async saveWorkoutSession(session: WorkoutSession): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving workout session:', session);
    return { success: true };
  },

  async getWorkoutHistory(userId: string): Promise<WorkoutSession[]> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Mock workout history
    const mockSessions: WorkoutSession[] = [
      {
        id: '1',
        workoutId: '1',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        startTime: '09:00:00',
        endTime: '10:15:00',
        exercises: [
          {
            exerciseId: '1',
            sets: [
              { reps: 8, weight: 75, completed: true },
              { reps: 8, weight: 75, completed: true },
              { reps: 6, weight: 80, completed: true },
            ],
          },
        ],
        notes: 'Good workout, felt strong today',
      },
      {
        id: '2',
        workoutId: '2',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // Two days ago
        startTime: '18:30:00',
        endTime: '19:25:00',
        exercises: [
          {
            exerciseId: '3',
            sets: [
              { reps: 10, weight: 0, completed: true },
              { reps: 8, weight: 0, completed: true },
              { reps: 6, weight: 0, completed: false },
            ],
          },
        ],
      },
    ];

    return mockSessions;
  },
};