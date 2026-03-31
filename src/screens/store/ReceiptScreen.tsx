import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/api/auth';
import { Header } from '@/components/Header';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { ordersApi } from '@/api/orders';

const { width } = Dimensions.get('window');

interface OrderDetails {
  id: string;
  total_amount: number;
  created_at: string;
  status: 'pending' | 'completed' | 'paid' | 'failed';
  delivery_status: 'pending' | 'delivered' | 'cancelled';
  delivery_date?: string | null;
  gym_id?: string;
  gym_name?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    product_name?: string;
  }>;
}

const ReceiptScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { orderId } = route.params || {};

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const getStatusInfo = (status: any, deliveryStatus: any = 'pending') => {
    // Normalizar el status: 'paid' y 'completed' son lo mismo
    let normalizedStatus = status;
    if (status === 'paid' || status === 'completed') {
      normalizedStatus = 'completed';
    } else if (status !== 'pending' && status !== 'failed') {
      normalizedStatus = 'pending';
    }
    
    switch (normalizedStatus) {
      case 'completed':
        return {
          color: colors.primary,
          icon: 'checkmark',
          title: '¡Compra Exitosa!',
          message: 'Tu pedido ha sido procesado correctamente',
          instruction: `Presenta este comprobante en ${order?.gym_name || 'el gym'} para recoger tu pedido`,
          deliveryStatus: deliveryStatus === 'delivered' 
            ? '✅ Entregado'
            : deliveryStatus === 'cancelled'
            ? '❌ Cancelado'
            : '📦 Entrega Pendiente',
        };
      case 'pending':
        return {
          color: '#F59E0B',
          icon: 'time-outline',
          title: 'Compra Pendiente',
          message: 'Tu pedido está siendo procesado. Se confirmará pronto',
          instruction: 'Cuando tu pago se confirme, podrás usar este comprobante para recoger tu pedido',
          deliveryStatus: null,
        };
      case 'failed':
        return {
          color: '#EF4444',
          icon: 'close',
          title: 'Compra Fallida',
          message: 'Hubo un problema al procesar tu pedido',
          instruction: 'Tu compra no se pudo procesar. Por favor intenta nuevamente o contacta soporte',
          deliveryStatus: null,
        };
      default:
        return {
          color: colors.textSecondary,
          icon: 'help-circle',
          title: 'Estado Desconocido',
          message: 'No se pudo determinar el estado de tu pedido',
          instruction: 'Por favor contacta soporte',
          deliveryStatus: null,
        };
    }
  };

  const handlePayment = async () => {
    if (!order || !user) {
      Alert.alert('Error', 'No se pudo procesar el pago');
      return;
    }

    try {
      setProcessing(true);

      // Obtener los items de la orden para recrear el payment intent
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, price_at_purchase')
        .eq('order_id', order.id);

      if (!orderItems) {
        throw new Error('No se pudieron obtener los items de la orden');
      }

      const items = orderItems.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price_at_purchase,
      }));

      // Crear payment intent
      const paymentData = await ordersApi.createPaymentIntent(user.id, order.total_amount, items);
      if (!paymentData) {
        throw new Error('No se pudo crear el payment intent');
      }

      // Actualizar orden con payment intent ID
      await ordersApi.updateOrderWithPaymentIntent(order.id, paymentData.paymentIntentId);

      // Inicializar payment sheet
      const initResponse = await initPaymentSheet({
        paymentIntentClientSecret: paymentData.clientSecret,
        merchantDisplayName: 'FitConnect',
        returnURL: 'fitconnect://payment-complete',
        style: 'alwaysDark',
      });

      if (initResponse.error) {
        throw new Error('Error initializing payment sheet: ' + initResponse.error.message);
      }

      // Presentar payment sheet
      const paymentResponse = await presentPaymentSheet();

      if (paymentResponse.error) {
        if (paymentResponse.error.code === 'Canceled') {
          Alert.alert('Pago cancelado', 'El pago fue cancelado por el usuario');
          return;
        }
        throw new Error('Payment failed: ' + paymentResponse.error.message);
      }

      // Confirmar el pago
      await ordersApi.confirmOrderPayment(order.id);

      // Actualizar el estado local de la orden
      setOrder({ ...order, status: 'completed' });

      Alert.alert('Éxito', 'Tu pago se completó correctamente', [
        {
          text: 'OK',
          onPress: () => {
            // Recargar los detalles de la orden
            fetchOrderDetails();
          },
        },
      ]);
    } catch (error) {
      console.error('Error during payment:', error);
      Alert.alert('Error en el pago', error instanceof Error ? error.message : 'Hubo un error procesando tu pago');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Monitorear cambios en delivery_status
  useEffect(() => {
    if (!orderId || !order) return;

    // Solicitar permisos de notificación
    notificationsApi.requestNotificationPermissions();

    // Configurar polling para cambios en delivery_status
    let isMounted = true;
    const deliveryCheckInterval = setInterval(async () => {
      if (!isMounted || monitoringDelivery) return;
      
      setMonitoringDelivery(true);
      
      try {
        const { data: updatedOrder } = await supabase
          .from('orders')
          .select('delivery_status, delivery_date')
          .eq('id', orderId)
          .single();

        if (!isMounted) return;

        if (updatedOrder) {
          // Verificar si hubo cambio de status y enviar notificación
          if (
            updatedOrder.delivery_status === 'delivered' &&
            previousDeliveryStatus !== 'delivered'
          ) {
            // Crear ID único para la notificación basado en orderId
            const notificationId = `delivery_${orderId}`;

            // Enviar push notification
            await notificationsApi.sendDeliveryPushNotification(
              order.id.substring(0, 8),
              updatedOrder.delivery_date
            );

            // Crear notificación en la BD (si no existe)
            const notificationRecord = {
              id: notificationId,
              title: '✅ ¡Tu orden fue entregada!',
              message: `Tu orden fue entregada el ${new Date(updatedOrder.delivery_date).toLocaleDateString('es-MX')}`,
              date: new Date().toISOString(),
              read: false,
              type: 'general' as const,
              data: {
                orderId,
                deliveryDate: updatedOrder.delivery_date,
              },
            };

            await notificationsApi.createNotification(notificationRecord);

            // Actualizar estado local
            if (isMounted) {
              setPreviousDeliveryStatus('delivered');
              setOrder(prev => prev ? {
                ...prev,
                delivery_status: 'delivered',
                delivery_date: updatedOrder.delivery_date
              } : null);

              // Mostrar alerta
              Alert.alert(
                '✅ ¡Tu orden fue entregada!',
                `Tu pedido fue entregado el ${new Date(updatedOrder.delivery_date).toLocaleDateString('es-MX')}`
              );
            }
          }
        }
      } catch (error) {
        console.error('Error monitoring delivery status:', error);
      } finally {
        if (isMounted) {
          setMonitoringDelivery(false);
        }
      }
    }, 5000); // Verificar cada 5 segundos

    return () => {
      isMounted = false;
      clearInterval(deliveryCheckInterval);
    };
  }, [orderId, order, previousDeliveryStatus]);

  const fetchOrderDetails = async () => {
    try {
      // Obtener detalles de la orden
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, total_amount, created_at, status, gym_id, delivery_status, delivery_date')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('Error fetching order:', orderError);
        setLoading(false);
        return;
      }

      // Obtener items de la orden
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity, price_at_purchase')
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        setLoading(false);
        return;
      }

      // Obtener detalles de los productos
      const itemsWithNames = await Promise.all(
        items.map(async (item) => {
          const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', item.product_id)
            .single();

          return {
            ...item,
            product_name: product?.name || 'Producto desconocido',
          };
        })
      );

      // Obtener nombre del gym si existe
      let gymName = undefined;
      if (orderData.gym_id) {
        const { data: gym } = await supabase
          .from('gyms')
          .select('name')
          .eq('id', orderData.gym_id)
          .single();

        gymName = gym?.name;
      }

      setOrder({
        ...orderData,
        status: (orderData.status === 'completed' || orderData.status === 'paid' || orderData.status === 'pending' || orderData.status === 'failed' 
          ? (orderData.status === 'paid' ? 'completed' : orderData.status)
          : 'pending') as 'pending' | 'completed' | 'paid' | 'failed',
        delivery_status: (orderData.delivery_status === 'pending' || orderData.delivery_status === 'delivered' || orderData.delivery_status === 'cancelled'
          ? orderData.delivery_status
          : 'pending') as 'pending' | 'delivered' | 'cancelled',
        items: itemsWithNames,
        gym_name: gymName,
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header 
          title="Comprobante de Compra"
          leftAction={{
            icon: <Ionicons name="chevron-back" size={28} color={colors.text} />,
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando comprobante...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header 
          title="Comprobante de Compra"
          leftAction={{
            icon: <Ionicons name="chevron-back" size={28} color={colors.text} />,
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.primary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            No se pudo cargar el comprobante
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Comprobante de Compra"
        leftAction={{
          icon: <Ionicons name="chevron-back" size={28} color={colors.text} />,
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Receipt Card */}
        <View style={[styles.receiptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Status Header */}
          {order && (
            <View style={styles.successHeader}>
              <View style={[styles.successCircle, { backgroundColor: getStatusInfo(order.status, order.delivery_status).color }]}>
                <Ionicons 
                  name={getStatusInfo(order.status, order.delivery_status).icon as any} 
                  size={32} 
                  color="#fff" 
                />
              </View>
              <Text style={[styles.successTitle, { color: colors.text }]}>
                {getStatusInfo(order.status, order.delivery_status).title}
              </Text>
              <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
                {getStatusInfo(order.status, order.delivery_status).message}
              </Text>
            </View>
          )}

          {/* Order Number */}
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              NÚMERO DE ORDEN
            </Text>
            <Text style={[styles.orderNumber, { color: colors.primary }]}>
              {order?.id.toUpperCase().slice(0, 8)}
            </Text>
            <Text style={[styles.fullOrderId, { color: colors.textSecondary }]}>
              {order?.id}
            </Text>
          </View>

          {/* Date */}
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              FECHA Y HORA
            </Text>
            <Text style={[styles.dateTime, { color: colors.text }]}>
              {formatDate(order?.created_at || '')}
            </Text>
          </View>

          {/* Status */}
          {order && (
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                ESTADO
              </Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: getStatusInfo(order.status, order.delivery_status).color }]} />
                <Text style={[styles.statusLabel, { color: getStatusInfo(order.status, order.delivery_status).color }]}>
                  {(() => {
                    switch (order.status) {
                      case 'completed':
                        return 'Completada';
                      case 'pending':
                        return 'Pendiente';
                      case 'failed':
                        return 'Fallida';
                      default:
                        return order.status;
                    }
                  })()}
                </Text>
              </View>
              {getStatusInfo(order.status, order.delivery_status).deliveryStatus && (
                <View style={[styles.deliveryStatusContainer, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                  <Text style={[styles.deliveryStatus, { color: colors.primary }]}>
                    {getStatusInfo(order.status, order.delivery_status).deliveryStatus}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Gym Info */}
          {Boolean(order.gym_name) && (
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                RECOGER EN
              </Text>
              <View style={styles.gymInfo}>
                <Ionicons name="location" size={18} color={colors.primary} />
                <Text style={[styles.gymName, { color: colors.text }]}>
                  {order.gym_name}
                </Text>
              </View>
            </View>
          )}

          {/* Items */}
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              PRODUCTOS COMPRADOS
            </Text>
            {order.items.map((item) => (
              <View key={item.product_id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                    {item.product_name}
                  </Text>
                  <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                    Cantidad: {item.quantity}
                  </Text>
                </View>
                <View style={styles.itemPrice}>
                  <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                    ${item.price_at_purchase.toFixed(2)}
                  </Text>
                  <Text style={[styles.subtotal, { color: colors.primary }]}>
                    ${(item.quantity * item.price_at_purchase).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={styles.totalSection}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              TOTAL
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ${order?.total_amount.toFixed(2)}
            </Text>
          </View>

          {/* Instructions */}
          {order?.status === 'completed' && (
            <View style={[styles.instructions, { backgroundColor: colors.background }]}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={[styles.instructionText, { color: colors.text }]}>
                Presenta este comprobante en {order.gym_name || 'el gym'} para recoger tu pedido
              </Text>
            </View>
          )}
          {order?.status === 'pending' && (
            <View style={[styles.instructions, { backgroundColor: colors.background }]}>
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <Text style={[styles.instructionText, { color: colors.text }]}>
                Cuando tu pago se confirme, podrás usar este comprobante para recoger tu pedido
              </Text>
            </View>
          )}
          {order?.status === 'failed' && (
            <View style={[styles.instructions, { backgroundColor: colors.background }]}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={[styles.instructionText, { color: colors.text }]}>
                Tu compra no se pudo procesar. Por favor intenta nuevamente o contacta soporte
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {order?.status === 'pending' && (
            <TouchableOpacity
              style={[styles.payButton, { backgroundColor: colors.primary, opacity: processing ? 0.6 : 1 }]}
              onPress={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" size={18} />
              ) : (
                <>
                  <Ionicons name="card-outline" size={18} color="#fff" />
                  <Text style={styles.payButtonText}>Pagar Ahora</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Store' as never, params: { screen: 'StoreList' } as never }],
              });
            }}
          >
            <Text style={styles.continueButtonText}>Volver a Tienda</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  receiptCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  successMessage: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  fullOrderId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  dateTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  gymInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gymName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
  },
  itemPrice: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  subtotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  instructions: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  payButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deliveryStatusContainer: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  deliveryStatus: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ReceiptScreen;
