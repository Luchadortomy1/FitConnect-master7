import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { CartItem, NutritionEntry, WorkoutSession, Notification } from '@/types';
import { notificationsApi } from '@/api/notifications';

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
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => Promise<Notification | null>;
  deleteNotification: (notificationId: string) => Promise<void>;
  loadNotifications: () => Promise<void>;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
  const markNotificationAsRead = async (notificationId: string) => {
    // Update local state immediately for better UX
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    // Save to database
    try {
      await notificationsApi.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read in database:', error);
    }
  };

  const addNotification = async (notification: Notification) => {
    // First check if notification already exists (prevent duplicates)
    const exists = notifications.some(n => n.id === notification.id);
    if (exists) {
      return null;
    }

    // Save to database first
    try {
      const savedNotification = await notificationsApi.createNotification(notification);
      
      if (savedNotification) {
        // Update local state with database response
        setNotifications(prev => [savedNotification, ...prev]);
        return savedNotification;
      }
      return null;
    } catch (error) {
      console.error('Error adding notification:', error);
      return null;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    // Update local state immediately for better UX
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );

    // Delete from database
    try {
      await notificationsApi.deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification in database:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const storedNotifications = await notificationsApi.getUserNotifications();
      setNotifications(storedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
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
    deleteNotification,
    loadNotifications,
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