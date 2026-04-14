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
import { useApp } from '@/contexts/AppContext';
import { gymsApi, userSubscriptionsApi } from '@/api';
import { StripePaymentSheet } from '@/components/StripePaymentSheet';
import { Gym } from '@/types';
import { UserSubscription } from '@/api/userSubscriptions';

const { width: screenWidth } = Dimensions.get('window');

const GymDetailScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { addNotification } = useApp();
  const { gym: initialGym } = route.params as { gym: Gym };
  
  const [gym, setGym] = useState<Gym>(initialGym);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const [isUserSubscriptionExpired, setIsUserSubscriptionExpired] = useState(false);
  const [isRecurringBillingEnabled, setIsRecurringBillingEnabled] = useState(false);
  const [isCancellationScheduled, setIsCancellationScheduled] = useState(false);
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
      
      const gymSubscriptions = subscriptions
        .filter(sub => sub.gym_id === initialGym.id)
        .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());

      const now = Date.now();
      const activeGymSubscription = gymSubscriptions.find(
        sub => sub.status === 'active' && new Date(sub.end_date).getTime() > now
      );
      const expiredGymSubscription = gymSubscriptions.find(sub => sub.status === 'expired');
      const gymSubscription = activeGymSubscription || expiredGymSubscription || null;

      const isSubscribed = Boolean(activeGymSubscription);
      const isExpired = Boolean(!activeGymSubscription && expiredGymSubscription);

      setCurrentSubscription(gymSubscription);
      setIsUserSubscribed(isSubscribed);
      setIsUserSubscriptionExpired(isExpired);
      setIsRecurringBillingEnabled(Boolean(activeGymSubscription?.auto_renew));
      setIsCancellationScheduled(Boolean(activeGymSubscription?.cancel_at_period_end));
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const formatSubscriptionDate = (dateIso?: string) => {
    if (!dateIso) return 'fecha no disponible';
    return new Date(dateIso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleCancelSubscription = () => {
    if (!currentSubscription) return;

    Alert.alert(
      'Cancelar al final del periodo',
      `Tu suscripción seguirá activa hasta ${formatSubscriptionDate(currentSubscription.end_date)} y no se renovará automáticamente.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, programar cancelación',
          style: 'destructive',
          onPress: () => { void handleConfirmCancel(); },
        },
      ]
    );
  };

  const handleConfirmCancel = async () => {
    try {
      setIsSubscribing(true);
      if (currentSubscription) {
        const scheduled = await userSubscriptionsApi.cancelSubscription(currentSubscription.id);
        if (scheduled) {
          Alert.alert(
            'Cancelación programada',
            `La suscripción queda activa hasta ${formatSubscriptionDate(currentSubscription.end_date)}. Después se desactivará.`
          );
          setIsCancellationScheduled(true);
          setIsRecurringBillingEnabled(false);
          await loadUserSubscriptions();
        } else {
          Alert.alert('Error', 'No se pudo programar la cancelación');
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
    const subscription = currentSubscription;
    if (subscription && subscriptionPlans.length > 0) {
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
      const subscription = currentSubscription;
      if (subscription) {
        const wasExpired = isUserSubscriptionExpired;
        const result = await userSubscriptionsApi.renewSubscription(subscription.id, paymentIntentId);
        if (result) {
          Alert.alert(
            'Éxito',
            wasExpired
              ? '¡Tu suscripción ha sido renovada correctamente!'
              : 'Se agregó 1 mes adicional a tu suscripción activa.'
          );
          await addNotification({
            id: `renewal-success-${subscription.id}`,
            title: '✅ Suscripción renovada',
            message: `Tu suscripción a ${initialGym.name} se renovó exitosamente`,
            date: new Date().toISOString(),
            read: false,
            type: 'subscription',
            data: { gym_id: initialGym.id, subscription_id: subscription.id },
          });
          setIsUserSubscriptionExpired(false);
          if (wasExpired) {
            setIsUserSubscribed(true);
          }
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
      const subscription = currentSubscription;
      if (subscription) {
        const cancelled = await userSubscriptionsApi.cancelSubscription(subscription.id, { immediate: true });
        if (cancelled) {
          Alert.alert('Éxito', 'Tu suscripción expirada fue cancelada');
          setIsUserSubscribed(false);
          setIsUserSubscriptionExpired(false);
          setCurrentSubscription(null);
          await loadUserSubscriptions();
        } else {
          Alert.alert('Error', 'No se pudo cancelar la suscripción expirada');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo cancelar la suscripción');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleToggleRecurringBilling = async () => {
    if (!currentSubscription) return;

    try {
      setIsSubscribing(true);
      const nextEnabled = !isRecurringBillingEnabled;
      const updated = await userSubscriptionsApi.setRecurringBilling(currentSubscription.id, nextEnabled);

      if (updated) {
        setIsRecurringBillingEnabled(nextEnabled);
        if (nextEnabled) {
          setIsCancellationScheduled(false);
        }

        Alert.alert(
          'Facturación periódica',
          nextEnabled
            ? 'La facturación periódica quedó activada para esta suscripción.'
            : 'La facturación periódica quedó desactivada.'
        );

        await loadUserSubscriptions();
      } else {
        Alert.alert('No disponible', 'No se pudo actualizar la facturación periódica. Verifica la migración de suscripciones.');
      }
    } catch (error) {
      console.error('Error updating recurring billing:', error);
      Alert.alert('Error', 'No se pudo cambiar la facturación periódica.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const getSubscriptionButtonText = (): string => {
    if (isSubscribing) {
      if (isUserSubscriptionExpired) return 'Procesando...';
      if (isUserSubscribed) return 'Cancelando...';
      return 'Suscribiendo...';
    }

    if (isUserSubscriptionExpired) {
      return 'Renovar';
    }

    if (!isUserSubscribed) {
      return 'Suscribirse';
    }

    if (isCancellationScheduled) {
      return 'Cancelación programada';
    }

    return 'Cancelar al finalizar';
  };

  const getSubscriptionButtonColor = (): string => {
    if (isUserSubscriptionExpired) return colors.warning;
    if (isUserSubscribed && isCancellationScheduled) return colors.warning;
    if (isUserSubscribed) return colors.error;
    return colors.success;
  };

  const getSubscriptionButtonIcon = (): string => {
    if (isUserSubscriptionExpired) return 'refresh-outline';
    if (isUserSubscribed && isCancellationScheduled) return 'time-outline';
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
        await addNotification({
          id: `subscription-success-${initialGym.id}-${Date.now()}`,
          title: '✅ Suscripción activa',
          message: `Te has suscrito a ${initialGym.name} correctamente`,
          date: new Date().toISOString(),
          read: false,
          type: 'subscription',
          data: { gym_id: initialGym.id },
        });
        await loadUserSubscriptions();
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

  const formatOpeningHours = () => {
    if (!gym.opening_time || !gym.closing_time) {
      return {
        today: 'Hours not available',
        isOpen: false,
      };
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMin;

    // Parse opening and closing times (assuming format HH:MM)
    const [openHour, openMin] = gym.opening_time.split(':').map(Number);
    const [closeHour, closeMin] = gym.closing_time.split(':').map(Number);

    const openingTimeInMinutes = openHour * 60 + openMin;
    const closingTimeInMinutes = closeHour * 60 + closeMin;

    const isCurrentlyOpen = currentTimeInMinutes >= openingTimeInMinutes && currentTimeInMinutes < closingTimeInMinutes;

    return {
      today: `${gym.opening_time} - ${gym.closing_time}`,
      isOpen: isCurrentlyOpen,
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
              <View style={{ marginTop: 10, gap: 10 }}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: getSubscriptionButtonColor() }]}
                  onPress={isUserSubscribed ? handleCancelSubscription : handleSubscribe}
                  disabled={isSubscribing || (isUserSubscribed && isCancellationScheduled)}
                >
                  <Ionicons name={getSubscriptionButtonIcon()} size={20} color="white" />
                  <Text style={styles.primaryButtonText}>
                    {getSubscriptionButtonText()}
                  </Text>
                </TouchableOpacity>

                {isUserSubscribed && currentSubscription && (
                  <>
                    <View style={[styles.subscriptionInfoBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
                      <Text style={[styles.subscriptionInfoText, { color: colors.textSecondary }]}>
                        Vence el {formatSubscriptionDate(currentSubscription.end_date)}
                      </Text>
                      {isCancellationScheduled && (
                        <Text style={[styles.subscriptionInfoText, { color: colors.warning }]}>
                          Cancelación programada al finalizar el periodo
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: colors.warning }]}
                      onPress={handleRenewalWithPayment}
                      disabled={isSubscribing}
                    >
                      <Ionicons name="add-circle-outline" size={20} color="white" />
                      <Text style={styles.primaryButtonText}>Pagar 1 mes extra</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: isRecurringBillingEnabled ? colors.success : colors.textSecondary }]}
                      onPress={handleToggleRecurringBilling}
                      disabled={isSubscribing}
                    >
                      <Ionicons name={isRecurringBillingEnabled ? 'repeat' : 'repeat-outline'} size={20} color="white" />
                      <Text style={styles.primaryButtonText}>
                        Facturación periódica: {isRecurringBillingEnabled ? 'Activada' : 'Desactivada'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
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

        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            {gym.description || 'No description available'}
          </Text>
        </View>

        {/* Opening Hours */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Opening Hours
          </Text>
          <View style={styles.hoursRow}>
            <Text style={[styles.dayText, { color: colors.text }]}>
              Hours
            </Text>
            <Text style={[styles.hoursTextRight, { color: colors.textSecondary }]}>
              {gym.opening_time && gym.closing_time 
                ? `${gym.opening_time} - ${gym.closing_time}`
                : 'Hours not available'}
            </Text>
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
  subscriptionInfoBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  subscriptionInfoText: {
    fontSize: 13,
    fontWeight: '500',
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
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
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