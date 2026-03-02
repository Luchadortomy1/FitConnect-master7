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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Spacing } from '@/constants/theme';
import { DayWorkout, Supplement } from '@/types';
import { routinesApi, storeApi, userSubscriptionsApi, gymsApi } from '@/api';
import { useApp } from '@/contexts/AppContext';
import { checkSubscriptionNotifications } from '@/utils/subscriptionNotifications';

const { width } = Dimensions.get('window');
const CAROUSEL_CARD_HEIGHT = 320;
const CAROUSEL_PAGE_WIDTH = width;
const CAROUSEL_CARD_WIDTH = width - 48; // leave margin so it doesn't touch edges

interface GymSubscription {
  id: string;
  gymId: string;
  gymName: string;
  planType: string;
  startDate: string;
  endDate: string;
  price: number;
  status: 'active' | 'expired' | 'expiring_soon';
}

const HomeScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { notifications, addNotification } = useApp();
  
  const [todayWorkout, setTodayWorkout] = useState<DayWorkout | null>(null);
  const [recommendedSupplements, setRecommendedSupplements] = useState<Supplement[]>([]);
  const [gymSubscriptions, setGymSubscriptions] = useState<GymSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calcular notificaciones sin leer
  const unreadCount = notifications.filter(n => !n.read).length;

  // Función para chequear y agregar notificaciones de expiración
  const checkAndAddExpirationNotifications = async () => {
    try {
      const subscriptions = await userSubscriptionsApi.getUserAllSubscriptions();
      const subscriptionNotifications = checkSubscriptionNotifications(subscriptions);
      
      for (const notification of subscriptionNotifications) {
        // Solo agregar si no existe una notificación con el mismo ID
        const existingNotif = notifications.find(
          n => n.id === notification.id
        );
        if (!existingNotif) {
          await addNotification(notification);
        }
      }
    } catch (error) {
      console.error('Error checking expiration notifications:', error);
    }
  };

  const loadDashboardData = async (includeNotifications: boolean = true) => {
    try {
      // Primero cargar todas las suscripciones (activas y expiradas)
      const subscriptions = await userSubscriptionsApi.getUserAllSubscriptions();
      const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
      
      // Cargar otros datos
      const [workout, supplements] = await Promise.all([
        routinesApi.getTodayWorkout(),
        activeSubscriptions.length > 0 ? getRecommendedSupplements(activeSubscriptions) : Promise.resolve([]),
      ]);
      
      setTodayWorkout(workout);
      // Mapear todas las suscripciones a GymSubscription
      let mappedSubscriptions: GymSubscription[] = [];
      if (subscriptions.length > 0) {
        mappedSubscriptions = subscriptions.map(subscription => {
          // Determinar estado basado en status de BD
          let status: 'active' | 'expired' | 'expiring_soon' = 'active';
          if (subscription.status === 'expired') {
            status = 'expired';
          } else if (subscription.status === 'active') {
            // Verificar si está por expirar en los próximos 7 días
            const daysUntilExpiry = getDaysUntilExpiration(subscription.end_date);
            if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
              status = 'expiring_soon';
            }
          }
          
          return {
            id: subscription.id,
            gymId: subscription.gym_id || '',
            gymName: subscription.gym_name || 'Gimnasio',
            planType: subscription.plan_name || 'Plan',
            startDate: subscription.start_date,
            endDate: subscription.end_date,
            price: subscription.plan_price || 0,
            status,
          };
        });
      }
      
      // Solo mostrar suplementos si hay suscripción activa
      setRecommendedSupplements(activeSubscriptions.length > 0 ? supplements : []);
      setGymSubscriptions(mappedSubscriptions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedSupplements = async (subscriptions: any[]): Promise<Supplement[]> => {
    try {
      // Obtener gym IDs de todas las suscripciones
      const gymIds = subscriptions
        .map(sub => sub.gym_id)
        .filter((id): id is string => Boolean(id));
      
      if (gymIds.length === 0) {
        return [];
      }

      // Obtener suplementos de todos los gyms
      const allSupplements = await storeApi.getSupplementsByGyms(gymIds);
      
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
        recommendedCategories.includes(supplement.category) && supplement.stock > 0
      );

      // Return top 3
      return filtered.slice(0, 3);
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
    // Chequear notificaciones de expiración cada vez que carga el home
    checkAndAddExpirationNotifications();
  }, [user]);

  // Recargar datos cuando la pantalla se enfoca - y chequear notificaciones de expiración
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData(false);
      // Chequear notificaciones de expiración cuando vuelve a esta pantalla
      checkAndAddExpirationNotifications();
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

  const getSubscriptionStatusText = (status: string): string => {
    switch (status) {
      case 'expired': return 'Expirada';
      case 'expiring_soon': return 'Por vencer';
      case 'active': return 'Activa';
      default: return 'Activa';
    }
  };

  const handleGymDetailNavigation = async (gymId: string) => {
    try {
      const gym = await gymsApi.getGym(gymId);
      if (gym) {
        // Usar reset para navegar a la pestaña Gyms y luego a GymDetail
        navigation.navigate('Gyms' as never, { 
          screen: 'GymDetail', 
          params: { gym } 
        } as never);
      } else {
        Alert.alert('Error', 'No se pudo cargar la información del gimnasio');
      }
    } catch (error) {
      console.error('Error loading gym:', error);
      Alert.alert('Error', 'No se pudo cargar la información del gimnasio');
    }
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

            {/* Gimnasios */}
            {gymSubscriptions.map((gymSubscription) => (
              <View key={gymSubscription.id} style={styles.carouselPage}>
                <Card style={styles.carouselCard}>
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
                      onPress={() => handleGymDetailNavigation(gymSubscription.gymId)}
                    >
                      <Text style={styles.carouselButtonText}>Gestionar Suscripción</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </View>
            ))}

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

            {/* Mis Macros */}
            <View style={styles.carouselPage}>
              <Card key="macros" style={styles.carouselCard}>
                <TouchableOpacity
                  style={styles.carouselContent}
                  onPress={() => navigation.navigate('ProfileStack' as never, { screen: 'ProfileMain' } as never)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.carouselIcon, { backgroundColor: colors.warning + '20' }]}>
                    <Ionicons name="nutrition-outline" size={32} color={colors.warning} />
                  </View>
                  <Text style={[styles.carouselTitle, { color: colors.text }]}>
                    Mis Macros
                  </Text>
                  <Text style={[styles.carouselSubtitle, { color: colors.textSecondary }]}>
                    Visualiza tus macronutrientes diarios
                  </Text>
                  <View style={[styles.carouselButton, { backgroundColor: colors.warning }]}>
                    <Text style={styles.carouselButtonText}>Ver Macros</Text>
                  </View>
                </TouchableOpacity>
              </Card>
            </View>

            {/* Mi Progreso */}
            <View style={styles.carouselPage}>
              <Card key="progress" style={styles.carouselCard}>
                <TouchableOpacity
                  style={styles.carouselContent}
                  onPress={() => navigation.navigate('ProfileStack' as never, { screen: 'Progress' } as never)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.carouselIcon, { backgroundColor: colors.info + '20' }]}>
                    <Ionicons name="trending-up-outline" size={32} color={colors.info} />
                  </View>
                  <Text style={[styles.carouselTitle, { color: colors.text }]}>
                    Mi Progreso
                  </Text>
                  <Text style={[styles.carouselSubtitle, { color: colors.textSecondary }]}>
                    Sigue tu evolución y logros
                  </Text>
                  <View style={[styles.carouselButton, { backgroundColor: colors.info }]}>
                    <Text style={styles.carouselButtonText}>Ver Progreso</Text>
                  </View>
                </TouchableOpacity>
              </Card>
            </View>
          </ScrollView>
        </View>

        {/* Recommended Supplements */}
        {gymSubscriptions.length > 0 && (
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
                      onPress={() => {
                        // Navegar a Store con StoreList como base y ProductDetail encima
                        navigation.dispatch(
                          CommonActions.navigate({
                            name: 'Store',
                            state: {
                              routes: [
                                { name: 'StoreList' },
                                { name: 'ProductDetail', params: { productId: supplement.id } }
                              ]
                            }
                          })
                        );
                      }}
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
                        <Text style={[styles.supplementPrice, { color: colors.primary }]}>
                          ${supplement.price}
                        </Text>
                        {typeof supplement.stock === 'number' && (
                          <Text style={[
                            styles.stockMessage,
                            {
                              color: supplement.stock === 0 
                                ? colors.error
                                : supplement.stock <= 3
                                ? colors.error
                                : colors.textSecondary
                            }
                          ]}>
                            {supplement.stock === 0 
                              ? 'Sin stock'
                              : supplement.stock <= 3
                              ? '¡Queda poco!'
                              : ''
                            }
                          </Text>
                        )}
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

        {/* Gym Subscriptions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Suscripción al Gimnasio
          </Text>
          
          {gymSubscriptions.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              style={styles.subscriptionsScroll}
            >
              {gymSubscriptions.map((subscription, index) => (
                <Card key={subscription.id} style={[styles.subscriptionCard, { marginRight: index === gymSubscriptions.length - 1 ? 0 : 12 }]}>
                  <View style={styles.subscriptionHeader}>
                    <View style={[styles.gymIcon, { backgroundColor: colors.info + '20' }]}>
                      <Ionicons name="business-outline" size={24} color={colors.info} />
                    </View>
                    <View style={styles.subscriptionInfo}>
                      <Text style={[styles.gymName, { color: colors.text }]}>
                        {subscription.gymName}
                      </Text>
                      <Text style={[styles.planType, { color: colors.textSecondary }]}>
                        {subscription.planType}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: getSubscriptionStatusColor(subscription.status) + '20' }
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        { color: getSubscriptionStatusColor(subscription.status) }
                      ]}>
                        {getSubscriptionStatusText(subscription.status)}
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
                          {formatDate(subscription.endDate)}
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
                          ${subscription.price}/mes
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
                          {getDaysUntilExpiration(subscription.endDate)} días
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </ScrollView>
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

  supplementPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockMessage: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  emptySupplementsCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySupplementsText: {
    fontSize: 14,
    marginTop: 12,
  },
  subscriptionsScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  subscriptionCard: {
    marginBottom: 8,
    minWidth: Dimensions.get('window').width - 64,
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