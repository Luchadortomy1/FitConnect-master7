export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female';
  goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'endurance';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  instructions: string[];
  image?: string;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  restTime: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number;
  exercises: WorkoutExercise[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'strength' | 'cardio' | 'flexibility' | 'hiit';
  image?: string;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  date: string;
  startTime: string;
  endTime?: string;
  exercises: {
    exerciseId: string;
    sets: {
      reps: number;
      weight: number;
      completed: boolean;
    }[];
  }[];
  notes?: string;
}

export interface Supplement {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'protein' | 'pre_workout' | 'vitamins' | 'creatine' | 'bcaa' | 'other';
  rating: number;
  reviews: number;
  ingredients: string[];
  servingSize: string;
  servingsPerContainer: number;
}

export interface CartItem {
  supplement: Supplement;
  quantity: number;
}

export interface Gym {
  id: string;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  website?: string;
  rating?: number;
  priceRange: '$' | '$$' | '$$$';
  amenities: string[];
  openHours: {
    [key: string]: string;
  };
  image?: string;
  images?: string[];
  distance?: number;
}

export interface NutritionEntry {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export interface Purchase {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'workout' | 'supplement' | 'general' | 'achievement';
}

export interface WeeklyRoutine {
  id: string;
  name: string;
  description?: string;
  weeklyPlan: {
    monday?: DayWorkout;
    tuesday?: DayWorkout;
    wednesday?: DayWorkout;
    thursday?: DayWorkout;
    friday?: DayWorkout;
    saturday?: DayWorkout;
    sunday?: DayWorkout;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface DayWorkout {
  id: string;
  name: string;
  exercises: DayExercise[];
  estimatedDuration?: number;
  notes?: string;
}

export interface DayExercise {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string; // Can be "8-12" or "15" etc
  weight?: number;
  notes?: string;
  equipment?: string;
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';