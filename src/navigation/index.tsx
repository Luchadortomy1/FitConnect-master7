import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

// Import screens (we'll create these next)
import LoginScreen from '@/screens/auth/LoginScreen';
import SignupScreen from '@/screens/auth/SignupScreen';
import AuthLoadingScreen from '@/screens/auth/AuthLoadingScreen';
import HomeScreen from '@/screens/HomeScreen';
import WorkoutsScreen from '@/screens/workouts/WorkoutsScreen';
import WorkoutDetailScreen from '@/screens/workouts/WorkoutDetailScreen';
import DayWorkoutScreen from '@/screens/workouts/DayWorkoutScreen';
import WorkoutSummaryScreen from '@/screens/workouts/WorkoutSummaryScreen';
import CreateRoutineScreen from '@/screens/workouts/CreateRoutineScreen';
import AddExerciseScreen from '@/screens/workouts/AddExerciseScreen';
import StoreScreen from '@/screens/store/StoreScreen';
import ProductDetailScreen from '@/screens/store/ProductDetailScreen';
import CartScreen from '@/screens/store/CartScreen';
import GymsScreen from '@/screens/gyms/GymsScreen';
import GymDetailScreen from '@/screens/gyms/GymDetailScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/profile/SettingsScreen';
import ProgressScreen from '@/screens/profile/ProgressScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';

// Icons (we'll use Ionicons from @expo/vector-icons)
import { Ionicons } from '@expo/vector-icons';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfileStack: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Workouts: undefined;
  Store: undefined;
  Gyms: undefined;
};

export type WorkoutStackParamList = {
  WorkoutsList: undefined;
  WorkoutDetail: { workoutId: string };
  DayWorkout: { dayWorkout: any; dayName: string; routineId: string };
  WorkoutSummary: {
    dayName: string;
    dayWorkout: any;
    completedSets: Record<string, boolean[]>;
    elapsedTime: number;
    routineId: string;
    dayKey: string;
  };
  CreateRoutine: undefined;
  EditRoutine: { routineId: string };
  AddExercise: { dayWorkout: any; routineId: string };
  CreateDayWorkout: { day: string; routineId: string };
};

export type StoreStackParamList = {
  StoreList: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
};

export type GymStackParamList = {
  GymsList: undefined;
  GymDetail: { gym: any };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const WorkoutStack = createStackNavigator<WorkoutStackParamList>();
const StoreStack = createStackNavigator<StoreStackParamList>();
const GymStack = createStackNavigator<GymStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Auth Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

// Workout Stack Navigator
const WorkoutNavigator = () => {
  
  return (
    <WorkoutStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <WorkoutStack.Screen 
        name="WorkoutsList" 
        component={WorkoutsScreen}
        options={{ title: 'Workouts' }}
      />
      <WorkoutStack.Screen 
        name="WorkoutDetail" 
        component={WorkoutDetailScreen}
        options={{ title: 'Workout Details' }}
      />
      <WorkoutStack.Screen 
        name="DayWorkout" 
        component={DayWorkoutScreen}
        options={{ title: 'Day Workout' }}
      />
      <WorkoutStack.Screen 
        name="WorkoutSummary" 
        component={WorkoutSummaryScreen}
        options={{ title: 'Workout Summary' }}
      />
      <WorkoutStack.Screen 
        name="CreateRoutine" 
        component={CreateRoutineScreen}
        options={{ title: 'Create Routine' }}
      />
      <WorkoutStack.Screen 
        name="EditRoutine" 
        component={CreateRoutineScreen}
        options={{ title: 'Edit Routine' }}
      />
      <WorkoutStack.Screen 
        name="AddExercise" 
        component={AddExerciseScreen}
        options={{ title: 'Add Exercise' }}
      />
    </WorkoutStack.Navigator>
  );
};

// Store Stack Navigator
const StoreNavigator = () => {
  
  return (
    <StoreStack.Navigator
      screenOptions={{
        headerShown: false,
        // Preserve state so we don't lose the stack when navigating from other tabs
        preserveState: true,
      }}
    >
      <StoreStack.Screen 
        name="StoreList" 
        component={StoreScreen}
        options={{ title: 'Supplements' }}
      />
      <StoreStack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <StoreStack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'Shopping Cart' }}
      />
    </StoreStack.Navigator>
  );
};

// Gym Stack Navigator
const GymNavigator = () => {
  
  return (
    <GymStack.Navigator
      screenOptions={{
        headerShown: false,
        // Preserve state so we don't lose the stack when navigating from other tabs
        preserveState: true,
      }}
    >
      <GymStack.Screen 
        name="GymsList" 
        component={GymsScreen}
        options={{ title: 'Gyms' }}
      />
      <GymStack.Screen 
        name="GymDetail" 
        component={GymDetailScreen}
        options={{ title: 'Gym Details' }}
      />
    </GymStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileNavigator = () => {
  
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ title: 'Mi Progreso' }}
      />
      <ProfileStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <ProfileStack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </ProfileStack.Navigator>
  );
};

// Main Tab Navigator
const MainNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Workouts':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'Store':
              iconName = focused ? 'storefront' : 'storefront-outline';
              break;
            case 'Gyms':
              iconName = focused ? 'location' : 'location-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter',
          marginBottom: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 74,
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 12,
        },
        headerShown: false,
      })}
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          // Get the current route and target route
          const state = navigation.getState();
          const srcRoute = state.routes[state.index];
          const destRoute = e.target?.split('-')[0];
          
          // If the tab is already focused, don't reset
          // This allows normal navigation within the tab
          if (srcRoute?.name === destRoute) {
            return;
          }
        }
      })}
    >
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Workouts" component={WorkoutNavigator} />
      <MainTab.Screen name="Store" component={StoreNavigator} />
      <MainTab.Screen name="Gyms" component={GymNavigator} />
    </MainTab.Navigator>
  );
};

// Root Navigator
const Navigation = () => {
  const { colors } = useTheme();
  const { isAuthenticated, loading, hasLoggedOut } = useAuth();
  
  console.log('Navigation - isAuthenticated:', isAuthenticated, 'loading:', loading, 'hasLoggedOut:', hasLoggedOut);
  
  // Mostrar pantalla de carga mientras se inicializa la autenticación
  if (loading) {
    return <AuthLoadingScreen />;
  }
  
  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen name="ProfileStack" component={ProfileNavigator} />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;