import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { CartItem, NutritionEntry, WorkoutSession, Notification } from '@/types';

interface AppContextType {
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (supplementId: string) => void;
  updateCartQuantity: (supplementId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  
  // Nutrition
  todayNutrition: NutritionEntry | null;
  updateNutrition: (nutrition: Partial<NutritionEntry>) => void;
  
  // Workouts
  activeWorkout: WorkoutSession | null;
  startWorkout: (workoutId: string) => void;
  endWorkout: () => void;
  updateWorkoutProgress: (exerciseId: string, setIndex: number, data: { reps: number; weight: number }) => void;
  
  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [todayNutrition, setTodayNutrition] = useState<NutritionEntry | null>({
    id: '1',
    date: new Date().toISOString().split('T')[0],
    calories: 1850,
    protein: 120,
    carbs: 220,
    fat: 65,
    water: 2.1,
  });
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: '¡Compra completada!',
      message: 'Tu orden de suplementos fue entregada exitosamente',
      date: new Date().toISOString(),
      read: false,
      type: 'order',
    },
    {
      id: '2',
      title: 'Recordatorio de entrenamiento',
      message: 'No olvides tu rutina de pecho de hoy a las 6 PM',
      date: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      type: 'workout',
    },
    {
      id: '3',
      title: '¡Nuevo suplemento disponible!',
      message: 'Protein Blend Premium 2kg - 20% descuento solo esta semana',
      date: new Date(Date.now() - 3600000).toISOString(),
      read: true,
      type: 'supplement',
    },
    {
      id: '4',
      title: 'Suscripción renovada',
      message: 'Tu suscripción Premium fue renovada por 30 días',
      date: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      type: 'subscription',
    },
    {
      id: '5',
      title: '¡Logro desbloqueado!',
      message: 'Completaste 50 entrenamientos - ¡Campeón de consistencia!',
      date: new Date(Date.now() - 172800000).toISOString(),
      read: true,
      type: 'achievement',
    },
  ]);

  // Cart functions
  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.supplement.id === item.supplement.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.supplement.id === item.supplement.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      return [...prevCart, item];
    });
  };

  const removeFromCart = (supplementId: string) => {
    setCart(prevCart => prevCart.filter(item => item.supplement.id !== supplementId));
  };

  const updateCartQuantity = (supplementId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(supplementId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.supplement.id === supplementId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.supplement.price * item.quantity), 0);

  // Nutrition functions
  const updateNutrition = (nutrition: Partial<NutritionEntry>) => {
    setTodayNutrition(prev => prev ? { ...prev, ...nutrition } : null);
  };

  // Workout functions
  const startWorkout = (workoutId: string) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      workoutId,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      exercises: [],
    };
    setActiveWorkout(newSession);
  };

  const endWorkout = () => {
    if (activeWorkout) {
      setActiveWorkout(prev => prev ? { ...prev, endTime: new Date().toISOString() } : null);
      // In a real app, you'd save this to storage/API
      setTimeout(() => setActiveWorkout(null), 1000);
    }
  };

  const updateWorkoutProgress = (exerciseId: string, setIndex: number, data: { reps: number; weight: number }) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      
      const exerciseIndex = prev.exercises.findIndex(ex => ex.exerciseId === exerciseId);
      if (exerciseIndex === -1) {
        // Add new exercise
        return {
          ...prev,
          exercises: [
            ...prev.exercises,
            {
              exerciseId,
              sets: [{ ...data, completed: true }],
            },
          ],
        };
      }

      // Update existing exercise
      const updatedExercises = [...prev.exercises];
      const exercise = updatedExercises[exerciseIndex];
      
      if (setIndex >= exercise.sets.length) {
        // Add new set
        exercise.sets.push({ ...data, completed: true });
      } else {
        // Update existing set
        exercise.sets[setIndex] = { ...data, completed: true };
      }

      return { ...prev, exercises: updatedExercises };
    });
  };

  // Notification functions
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const value: AppContextType = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    todayNutrition,
    updateNutrition,
    activeWorkout,
    startWorkout,
    endWorkout,
    updateWorkoutProgress,
    notifications,
    markNotificationAsRead,
    addNotification,
  }), [cart, cartTotal, todayNutrition, activeWorkout, notifications]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};