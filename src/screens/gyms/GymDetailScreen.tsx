import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { gymsApi, userSubscriptionsApi } from '@/api';
import { StripePaymentSheet } from '@/components/StripePaymentSheet';
import { Gym } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

const GymDetailScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { gym: initialGym } = route.params as { gym: Gym };
  
  const [gym, setGym] = useState<Gym>(initialGym);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const [isUserSubscriptionExpired, setIsUserSubscriptionExpired] = useState(false);
  const [isRenewalMode, setIsRenewalMode] = useState(false);

  useEffect(() => {
    loadGymDetails();
    loadUserLocation();
    loadSubscriptionPlans();
    loadUserSubscriptions();
  }, []);

  const loadGymDetails = async () => {
    try {
      setLoading(true);
      const detailedGym = await gymsApi.getGym(initialGym.id);
      if (detailedGym) {
        setGym(detailedGym);
      }
    } catch (error) {
      console.error('Error loading gym details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      // Obtener planes de suscripción del gimnasio
      const plans = await gymsApi.getGymSubscriptionPlans(initialGym.id);
      console.log('Plans loaded for gym', initialGym.id, ':', plans);
      setSubscriptionPlans(plans || []);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    }
  };

  const loadUserLocation = async () => {
    const location = await gymsApi.getCurrentLocation();
    if (location) {
      // setUserLocation(location); // Location not needed for basic display
    }
  };

  const loadUserSubscriptions = async () => {
    try {
      const subscriptions = await userSubscriptionsApi.getUserAllSubscriptions();
      setUserSubscriptions(subscriptions);
      
      // Verificar si el usuario está suscrito a este gym (activo o expirado)
      const gymSubscription = subscriptions.find(sub => sub.gym_id === initialGym.id);
      const isSubscribed = !!gymSubscription;
      const isExpired = gymSubscription?.status === 'expired';
      
      setIsUserSubscribed(isSubscribed);
      setIsUserSubscriptionExpired(isExpired);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar Suscripción',
      '¿Estás seguro de que deseas cancelar tu suscripción a este gimnasio?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: () => { void handleConfirmCancel(); },
        },
      ]
    );
  };

  const handleConfirmCancel = async () => {
    try {
      setIsSubscribing(true);
      const subscription = userSubscriptions.find(sub => sub.gym_id === initialGym.id);
      if (subscription) {
        if (isUserSubscriptionExpired) {
          // Si está expirada, renovar
          const renewed = await userSubscriptionsApi.renewSubscription(subscription.id);
          if (renewed) {
            Alert.alert('Éxito', 'Tu suscripción ha sido renovada');
            setIsUserSubscriptionExpired(false);
            await loadUserSubscriptions();
          } else {
            Alert.alert('Error', 'No se pudo renovar la suscripción');
          }
        } else {
          // Si está activa, cancelar
          await userSubscriptionsApi.cancelSubscription(subscription.id);
          Alert.alert('Éxito', 'Tu suscripción ha sido cancelada');
          setIsUserSubscribed(false);
          await loadUserSubscriptions();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo procesar la solicitud');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleRenewalWithPayment = async () => {
    // Obtener el plan actual de la suscripción expirada
    const subscription = userSubscriptions.find(sub => sub.gym_id === initialGym.id);
    if (subscription && subscriptionPlans.length > 0) {
      // Usar el plan actual para la renovación
      const currentPlan = subscriptionPlans.find(p => p.id === subscription.plan_id) || subscriptionPlans[0];
      setSelectedPlan(currentPlan);
      setIsRenewalMode(true);
      setShowPaymentModal(true);
    } else {
      Alert.alert('Error', 'No se pudo obtener la información del plan');
    }
  };

  const renewWithPayment = async (paymentIntentId: string) => {
    try {
      setIsSubscribing(true);
      const subscription = userSubscriptions.find(sub => sub.gym_id === initialGym.id);
      if (subscription) {
        const result = await userSubscriptionsApi.renewSubscription(subscription.id, paymentIntentId);
        if (result) {
          Alert.alert('Éxito', '¡Tu suscripción ha sido renovada correctamente!');
          setIsUserSubscriptionExpired(false);
          await loadUserSubscriptions();
        } else {
          Alert.alert('Error', 'No se pudo renovar la suscripción');
        }
      }
    } catch (error) {
      console.error('Error renewing subscription:', error);
      Alert.alert('Error', 'Ocurrió un error al intentar renovar');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCancelExpiredSubscription = async () => {
    try {
      setIsSubscribing(true);
      const subscription = userSubscriptions.find(sub => sub.gym_id === initialGym.id);
      if (subscription) {
        await userSubscriptionsApi.cancelSubscription(subscription.id);
        Alert.alert('Éxito', 'Tu suscripción ha sido cancelada');
        setIsUserSubscribed(false);
        setIsUserSubscriptionExpired(false);
        await loadUserSubscriptions();
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo cancelar la suscripción');
    } finally {
      setIsSubscribing(false);
    }
  };

  const getSubscriptionButtonText = (): string => {
    if (isSubscribing) {
      if (isUserSubscriptionExpired) return 'Renovando...';
      if (isUserSubscribed) return 'Cancelando...';
      return 'Suscribiendo...';
    }
    if (isUserSubscriptionExpired) {
      return 'Renovar';
    }
    return isUserSubscribed ? 'Cancelar' : 'Suscribirse';
  };

  const getSubscriptionButtonColor = (): string => {
    if (isUserSubscriptionExpired) return colors.warning;
    if (isUserSubscribed) return colors.error;
    return colors.success;
  };

  const getSubscriptionButtonIcon = (): string => {
    if (isUserSubscriptionExpired) return 'refresh-outline';
    if (isUserSubscribed) return 'trash-outline';
    return 'checkmark-circle';
  };

  const handleDirections = () => {
    const directionsUrl = gymsApi.getDirectionsUrl(gym);
    Linking.openURL(directionsUrl);
  };

  const handleCall = () => {
    if (gym.phone) {
      Linking.openURL(`tel:${gym.phone}`);
    }
  };

  const handleWebsite = () => {
    if (gym.website) {
      Linking.openURL(gym.website);
    }
  };

  const handleSubscribe = async () => {
    if (subscriptionPlans.length === 0) {
      Alert.alert('Sin planes', 'Este gimnasio no tiene planes disponibles');
      return;
    }

    // Si solo hay un plan, mostrar formulario de pago
    if (subscriptionPlans.length === 1) {
      setSelectedPlan(subscriptionPlans[0]);
      setShowPaymentModal(true);
    } else {
      // Si hay varios planes, mostrar opciones
      Alert.alert(
        'Selecciona un plan',
        'Por favor, selecciona el plan que deseas:',
        subscriptionPlans.map(plan => ({
          text: `${plan.name} - $${plan.price}/mes`,
          onPress: () => {
            setSelectedPlan(plan);
            setShowPaymentModal(true);
          },
        })).concat([{ text: 'Cancelar', onPress: () => {} }])
      );
    }
  };

  const subscribeToGym = async (planId: string, paymentIntentId?: string) => {
    try {
      setIsSubscribing(true);
      const result = await userSubscriptionsApi.subscribeToGym(planId, paymentIntentId);
      
      if (result) {
        Alert.alert('Éxito', '¡Te has suscrito al gimnasio correctamente!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', 'No se pudo completar la suscripción');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      Alert.alert('Error', 'Ocurrió un error al intentar suscribirse');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Diferenciar entre nueva suscripción y renovación
      if (isRenewalMode) {
        // Renovación con pago
        await renewWithPayment(paymentIntentId);
        setIsRenewalMode(false);
      } else if (selectedPlan) {
        // Nueva suscripción
        await subscribeToGym(selectedPlan.id, paymentIntentId);
      }
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error completing subscription:', error);
      Alert.alert('Error', 'Error al completar la suscripción');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={18} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={18} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={18} color="#FFD700" />
      );
    }

    return stars;
  };

  const formatOpeningHours = () => {
    const today = new Date().toLocaleDateString('en', { weekday: 'long' });
    const todayHours = gym.openHours[today];
    
    return {
      today: todayHours || 'Hours not available',
      isOpen: todayHours && todayHours !== 'Closed',
    };
  };

  const openingInfo = formatOpeningHours();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {gym.name}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="heart-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
          >
            {(gym.image ? [gym.image] : gym.images || []).map((image, index) => (
              <Image
                key={`${gym.id}-image-${index}`}
                source={{ uri: image }}
                style={styles.gymImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          {((gym.image ? [gym.image] : gym.images || []).length > 1) && (
            <View style={styles.imageIndicators}>
              {(gym.image ? [gym.image] : gym.images || []).map((image, index) => (
                <View
                  key={`${gym.id}-indicator-${image.slice(-10)}-${index}`}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: index === currentImageIndex 
                        ? colors.primary 
                        : 'rgba(255,255,255,0.5)'
                    }
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Basic Info */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.basicInfo}>
            <View style={styles.nameAndPrice}>
              <Text style={[styles.gymName, { color: colors.text }]}>
                {gym.name}
              </Text>
              <Text style={[styles.priceRange, { color: colors.primary }]}>
                {gym.priceRange}
              </Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(gym.rating)}
              </View>
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {gym.rating ? gym.rating.toFixed(1) : 'N/A'} rating
              </Text>
            </View>
            
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={[styles.address, { color: colors.textSecondary }]}>
                {gym.address}
              </Text>
              {gym.distance && (
                <Text style={[styles.distance, { color: colors.primary }]}>
                  • {gym.distance.toFixed(1)}km
                </Text>
              )}
            </View>

            {/* Opening Hours */}
            <View style={styles.hoursContainer}>
              <Ionicons 
                name="time" 
                size={16} 
                color={openingInfo.isOpen ? colors.success : colors.error} 
              />
              <Text style={[
                styles.hoursText, 
                { color: openingInfo.isOpen ? colors.success : colors.error }
              ]}>
                {openingInfo.isOpen ? 'Open' : 'Closed'} • {openingInfo.today}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleDirections}
            >
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Directions</Text>
            </TouchableOpacity>

            {/* Subscription Button(s) */}
            {isUserSubscriptionExpired ? (
              // Si está expirada: mostrar dos botones (Renovar y Cancelar)
              <View style={{ marginTop: 10, gap: 10 }}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.warning }]}
                  onPress={handleRenewalWithPayment}
                  disabled={isSubscribing}
                >
                  <Ionicons name="refresh-outline" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>
                    {isSubscribing ? 'Renovando...' : 'Renovar'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.error }]}
                  onPress={() => {
                    Alert.alert(
                      'Cancelar Suscripción',
                      '¿Estás seguro de que deseas cancelar esta suscripción expirada?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Sí, cancelar',
                          onPress: () => { handleCancelExpiredSubscription(); },
                          style: 'destructive',
                        },
                      ]
                    );
                  }}
                  disabled={isSubscribing}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>
                    {isSubscribing ? 'Cancelando...' : 'Cancelar'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Si está activa o sin suscripción: mostrar un botón
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: getSubscriptionButtonColor(), marginTop: 10 }]}
                onPress={isUserSubscribed ? handleCancelSubscription : handleSubscribe}
                disabled={isSubscribing}
              >
                <Ionicons name={getSubscriptionButtonIcon()} size={20} color="white" />
                <Text style={styles.primaryButtonText}>
                  {getSubscriptionButtonText()}
                </Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.secondaryButtons}>
              {!!gym.phone && (
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: colors.border }]}
                  onPress={handleCall}
                >
                  <Ionicons name="call" size={20} color={colors.text} />
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Call</Text>
                </TouchableOpacity>
              )}
              
              {!!gym.website && (
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: colors.border }]}
                  onPress={handleWebsite}
                >
                  <Ionicons name="globe" size={20} color={colors.text} />
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Website</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Amenities */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Amenities & Features
          </Text>
          <View style={styles.amenitiesGrid}>
            {gym.amenities.map((amenity, index) => (
              <View key={`${gym.id}-amenity-${index}`} style={[styles.amenityItem, { backgroundColor: colors.background }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.amenityText, { color: colors.text }]}>
                  {amenity}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Opening Hours */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Opening Hours
          </Text>
          <View style={styles.hoursGrid}>
            {Object.entries(gym.openHours).map(([day, hours]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={[styles.dayText, { color: colors.text }]}>
                  {day}
                </Text>
                <Text style={[styles.hoursTextRight, { color: colors.textSecondary }]}>
                  {hours}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.surface, marginBottom: 20 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact Information
          </Text>
          
          {!!gym.phone && (
            <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                {gym.phone}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          
          {!!gym.website && (
            <TouchableOpacity style={styles.contactRow} onPress={handleWebsite}>
              <Ionicons name="globe" size={20} color={colors.primary} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Visit Website
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.contactRow} onPress={handleDirections}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={[styles.contactText, { color: colors.text }]}>
              {gym.address}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Completar Suscripción</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedPlan && (
              <StripePaymentSheet
                planName={selectedPlan.name}
                amount={Math.round(selectedPlan.price * 100)}
                planId={selectedPlan.id}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentModal(false)}
                colors={colors}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 8,
    marginLeft: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  gymImage: {
    width: screenWidth,
    height: 250,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  basicInfo: {
    marginBottom: 20,
  },
  nameAndPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gymName: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  priceRange: {
    fontSize: 20,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  address: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  distance: {
    fontSize: 14,
    fontWeight: '500',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  amenitiesGrid: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  amenityText: {
    fontSize: 16,
    flex: 1,
  },
  hoursGrid: {
    gap: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  hoursTextRight: {
    fontSize: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: 16,
  },
  contactText: {
    flex: 1,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
});

export default GymDetailScreen;