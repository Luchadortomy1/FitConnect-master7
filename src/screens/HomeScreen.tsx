import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Spacing } from '@/constants/theme';
import { DayWorkout, Supplement, WeeklyRoutine, Gym } from '@/types';
import { routinesApi, storeApi, userSubscriptionsApi } from '@/api';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');
const CAROUSEL_CARD_HEIGHT = 320;
const CAROUSEL_PAGE_WIDTH = width;
const CAROUSEL_CARD_WIDTH = width - 48; // leave margin so it doesn't touch edges

interface GymSubscription {
  id: string;
  gymName: string;
  planType: string;
  startDate: string;
  endDate: string;
  price: number;
  status: 'active' | 'expired' | 'expiring_soon';
}

const HomeScreen = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { notifications } = useApp();
  
  const [todayWorkout, setTodayWorkout] = useState<DayWorkout | null>(null);
  const [recommendedSupplements, setRecommendedSupplements] = useState<Supplement[]>([]);
  const [gymSubscription, setGymSubscription] = useState<GymSubscription | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [routines, setRoutines] = useState<WeeklyRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calcular notificaciones sin leer
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mock gym subscription data
  // TODO: En el futuro, cargar suscripción actual del usuario desde la BD
  // Por ahora, si el usuario no está suscrito a ningún gym, será null

  const loadDashboardData = async () => {
    try {
      // Primero cargar suscripción
      const subscription = await userSubscriptionsApi.getUserActiveSubscription();
      
      // Cargar otros datos
      const [workout, supplements, allRoutines] = await Promise.all([
        routinesApi.getTodayWorkout(),
        subscription?.gym_id ? getRecommendedSupplements(subscription.gym_id) : Promise.resolve([]),
        routinesApi.getRoutines(),
      ]);
      
      setTodayWorkout(workout);
      // Solo mostrar suplementos si hay suscripción
      setRecommendedSupplements(subscription ? supplements : []);
      setRoutines(allRoutines);
      setActiveSubscription(subscription);
      
      // Mapear suscripción a GymSubscription
      if (subscription) {
        setGymSubscription({
          id: subscription.id,
          gymName: subscription.gym_name || 'Gimnasio',
          planType: subscription.plan_name || 'Plan',
          startDate: subscription.start_date,
          endDate: subscription.end_date,
          price: subscription.plan_price || 0,
          status: 'active',
        });
      } else {
        setGymSubscription(null);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedSupplements = async (gymId: string): Promise<Supplement[]> => {
    try {
      // Solo obtener suplementos del gym al que está suscrito
      const allSupplements = await storeApi.getSupplementsByGym(gymId);
      
      if (allSupplements.length === 0) {
        return [];
      }
      
      // Recommend based on BMI and workout type
      let recommendedCategories: string[] = [];
      
      if (user?.weight && user?.height) {
        const bmi = user.weight / Math.pow(user.height / 100, 2);
        
        if (bmi < 18.5) {
          // Underweight - muscle gain supplements
          recommendedCategories = ['protein', 'creatine'];
        } else if (bmi >= 25) {
          // Overweight - fat burning supplements
          recommendedCategories = ['pre_workout', 'vitamins'];
        } else {
          // Normal weight - general fitness
          recommendedCategories = ['protein', 'vitamins'];
        }
      } else {
        // Default recommendations
        recommendedCategories = ['protein', 'vitamins', 'pre_workout'];
      }

      // Add workout-specific recommendations
      if (todayWorkout) {
        const workoutName = todayWorkout.name.toLowerCase();
        if (workoutName.includes('pierna') || workoutName.includes('leg')) {
          recommendedCategories.push('bcaa');
        }
        if (workoutName.includes('pecho') || workoutName.includes('push')) {
          recommendedCategories.push('creatine');
        }
      }

      // Filter supplements by recommended categories
      const filtered = allSupplements.filter(supplement => 
        recommendedCategories.includes(supplement.category)
      );

      // Return top 3 highest rated
      const sortedSupplements = [...filtered].sort((a, b) => b.rating - a.rating);
      return sortedSupplements.slice(0, 3);
    } catch (error) {
      console.error('Error getting recommended supplements:', error);
      return [];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Recargar datos cuando la pantalla se enfoca (después de crear rutina)
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiration = (endDate: string): number => {
    const today = new Date();
    const expiration = new Date(endDate);
    const diffTime = expiration.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getSubscriptionStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return colors.success;
      case 'expiring_soon': return colors.warning;
      case 'expired': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getMuscleGroupIcon = (workoutName: string) => {
    const name = workoutName.toLowerCase();
    if (name.includes('pecho') || name.includes('push')) return 'body-outline' as const;
    if (name.includes('espalda') || name.includes('pull')) return 'chevron-back-outline' as const;
    if (name.includes('pierna') || name.includes('leg')) return 'walk-outline' as const;
    if (name.includes('hombro')) return 'triangle-outline' as const;
    if (name.includes('brazo') || name.includes('arm')) return 'hand-right-outline' as const;
    if (name.includes('upper')) return 'chevron-up-outline' as const;
    if (name.includes('lower')) return 'chevron-down-outline' as const;
    return 'fitness-outline' as const;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Dashboard" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title=""
        leftAction={{
          icon: (
            <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="barbell" size={18} color="#FFFFFF" />
            </View>
          ),
          onPress: () => {},
        }}
        rightActions={[
          {
            icon: (
              <View>
                <Ionicons name="notifications-outline" size={24} color={colors.text} />
                {unreadCount > 0 && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
            onPress: () => navigation.navigate('ProfileStack' as never, { screen: 'Notifications' } as never),
            accessibilityLabel: "Notificaciones",
          },
          {
            icon: <Ionicons name="person-circle-outline" size={24} color={colors.text} />,
            onPress: () => navigation.navigate('ProfileStack' as never),
            accessibilityLabel: "Perfil",
          },
        ]}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.section}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {getGreeting()}, {user?.name || 'Usuario'}! 👋
          </Text>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
            Aquí tienes tu resumen del día
          </Text>
        </View>

        {/* Carrusel Principal */}
        <View style={styles.section}>
          <ScrollView 
            horizontal 
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.mainCarousel}
            contentContainerStyle={styles.carouselContentContainer}
            snapToInterval={CAROUSEL_PAGE_WIDTH}
            decelerationRate="fast"
            snapToAlignment="center"
            bounces={false}
            alwaysBounceHorizontal={false}
            overScrollMode="never"
          >
            {/* Ver Rutinas */}
            <View style={styles.carouselPage}>
              <Card key="routines" style={styles.carouselCard}>
                <TouchableOpacity
                  style={styles.carouselContent}
                  onPress={() => navigation.navigate('Workouts' as never)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.carouselIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="fitness-outline" size={32} color={colors.primary} />
                  </View>
                  <Text style={[styles.carouselTitle, { color: colors.text }]}>
                    Mis Rutinas
                  </Text>
                  <Text style={[styles.carouselSubtitle, { color: colors.textSecondary }]}>
                    Gestiona y realiza tus entrenamientos
                  </Text>
                  <View style={[styles.carouselButton, { backgroundColor: colors.primary }]}>
                    <Text style={styles.carouselButtonText}>Ver Rutinas</Text>
                  </View>
                </TouchableOpacity>
              </Card>
            </View>

            {/* Gimnasio */}
            {gymSubscription && (
              <View style={styles.carouselPage}>
                <Card key="gym" style={styles.carouselCard}>
                  <View style={styles.carouselContent}>
                    <View style={[styles.carouselIcon, { backgroundColor: colors.info + '20' }]}>
                      <Ionicons name="business-outline" size={32} color={colors.info} />
                    </View>
                    <Text style={[styles.carouselTitle, { color: colors.text }]}>
                      {gymSubscription.gymName}
                    </Text>
                    <Text style={[styles.carouselSubtitle, { color: colors.textSecondary }]}>
                      {gymSubscription.planType}
                    </Text>
                    <View style={styles.gymDates}>
                      <Text style={[styles.carouselSubtitle, { color: colors.textSecondary }]}>
                        Hasta: {new Date(gymSubscription.endDate).toLocaleDateString('es-ES')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.carouselButton, { backgroundColor: colors.info }]}
                      onPress={() => navigation.navigate('Gyms' as never)}
                    >
                      <Text style={styles.carouselButtonText}>Gestionar Suscripción</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </View>
            )}

            {/* Suplementos */}
            <View style={styles.carouselPage}>
              <Card key="supplements" style={styles.carouselCard}>
                <TouchableOpacity
                  style={styles.carouselContent}
                  onPress={() => navigation.navigate('Store' as never)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.carouselIcon, { backgroundColor: colors.success + '20' }]}>
                    <Ionicons name="flask-outline" size={32} color={colors.success} />
                  </View>
                  <Text style={[styles.carouselTitle, { color: colors.text }]}>
                    Conseguir Suplementos
                  </Text>
                  <Text style={[styles.carouselSubtitle, { color: colors.textSecondary }]}>
                    Explora nuestro catálogo de suplementos
                  </Text>
                  <View style={[styles.carouselButton, { backgroundColor: colors.success }]}>
                    <Text style={styles.carouselButtonText}>Ir a Store</Text>
                  </View>
                </TouchableOpacity>
              </Card>
            </View>
          </ScrollView>
        </View>

        {/* Recommended Supplements */}
        {gymSubscription && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Suplementos Recomendados
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Store' as never)}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            
            {recommendedSupplements.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.supplementsScroll}
              >
                {recommendedSupplements.map((supplement) => (
                  <Card key={supplement.id} style={styles.supplementCard}>
                    <TouchableOpacity
                      style={styles.supplementContent}
                      onPress={() => navigation.navigate('Store' as never, { 
                        screen: 'ProductDetail',
                        params: { productId: supplement.id }
                      } as never)}
                    >
                      <Image 
                        source={{ uri: supplement.image }} 
                        style={styles.supplementImage}
                        resizeMode="cover"
                      />
                      <View style={styles.supplementInfo}>
                        <Text style={[styles.supplementName, { color: colors.text }]} numberOfLines={2}>
                          {supplement.name}
                        </Text>
                        <View style={styles.supplementRating}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                            {supplement.rating.toFixed(1)}
                          </Text>
                        </View>
                        <Text style={[styles.supplementPrice, { color: colors.primary }]}>
                          ${supplement.price}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Card>
                ))}
              </ScrollView>
            ) : (
              <Card style={styles.emptySupplementsCard}>
                <Ionicons name="flask-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptySupplementsText, { color: colors.textSecondary }]}>
                  No hay recomendaciones disponibles
                </Text>
              </Card>
            )}
          </View>
        )}

        {/* Gym Subscription */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Suscripción al Gimnasio
          </Text>
          
          {gymSubscription ? (
            <Card style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <View style={[styles.gymIcon, { backgroundColor: colors.info + '20' }]}>
                  <Ionicons name="business-outline" size={24} color={colors.info} />
                </View>
                <View style={styles.subscriptionInfo}>
                  <Text style={[styles.gymName, { color: colors.text }]}>
                    {gymSubscription.gymName}
                  </Text>
                  <Text style={[styles.planType, { color: colors.textSecondary }]}>
                    {gymSubscription.planType}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: getSubscriptionStatusColor(gymSubscription.status) + '20' }
                ]}>
                  <Text style={[
                    styles.statusText, 
                    { color: getSubscriptionStatusColor(gymSubscription.status) }
                  ]}>
                    Activa
                  </Text>
                </View>
              </View>
              
              <View style={styles.subscriptionDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Vence el
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatDate(gymSubscription.endDate)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Precio mensual
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      ${gymSubscription.price}/mes
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Días restantes
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.success }]}>
                      {getDaysUntilExpiration(gymSubscription.endDate)} días
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ) : (
            <Card style={styles.emptySubscriptionCard}>
              <Ionicons name="business-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptySubscriptionText, { color: colors.textSecondary }]}>
                No tienes una suscripción activa
              </Text>
              <TouchableOpacity
                style={[styles.findGymButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Gyms' as never)}
              >
                <Text style={styles.findGymText}>Buscar Gimnasios</Text>
              </TouchableOpacity>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.xxl,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  mainCarousel: {
    paddingVertical: 4,
  },
  carouselContentContainer: {
    paddingHorizontal: 0,
  },
  carouselPage: {
    width: CAROUSEL_PAGE_WIDTH,
    paddingHorizontal: 16,
  },
  carouselCard: {
    width: CAROUSEL_CARD_WIDTH,
    height: CAROUSEL_CARD_HEIGHT,
    alignSelf: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  carouselContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  carouselIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  carouselTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  carouselSubtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  carouselButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  carouselButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  gymDates: {
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  workoutCard: {
    marginBottom: 8,
  },
  workoutContent: {
    // Card styles already applied
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  workoutProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  progressText: {
    fontSize: 14,
  },
  startButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWorkoutCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyWorkoutContent: {
    alignItems: 'center',
  },
  emptyWorkoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyWorkoutText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  createRoutineButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createRoutineText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  supplementsScroll: {
    // Scroll styles
  },
  supplementCard: {
    width: 150,
    marginRight: 12,
  },
  supplementContent: {
    // Card styles already applied
  },
  supplementImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  supplementInfo: {
    // Info styles
  },
  supplementName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  supplementRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  supplementPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySupplementsCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySupplementsText: {
    fontSize: 14,
    marginTop: 12,
  },
  subscriptionCard: {
    marginBottom: 8,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gymIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  planType: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routinesScroll: {
    // Scroll styles
  },
  routineCard: {
    width: 140,
    marginRight: 12,
  },
  routineContent: {
    // Card styles already applied
  },
  routineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  routineStats: {
    // Stats styles
  },
  routineStatText: {
    fontSize: 12,
  },
  subscriptionDetails: {
    gap: 12,
  },
  detailRow: {
    // Row styles
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  emptySubscriptionCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySubscriptionText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 20,
  },
  findGymButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  findGymText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;