import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { CartItem } from '@/types';
import { ordersApi } from '@/api/orders';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

const { width } = Dimensions.get('window');

const CartScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal, addNotification } = useApp();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleRemoveItem = (supplementId: string) => {
    Alert.alert('Eliminar producto', '¿Deseas eliminar este producto del carrito?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => removeFromCart(supplementId),
      },
    ]);
  };

  const handleIncreaseQuantity = (supplementId: string, currentQuantity: number) => {
    updateCartQuantity(supplementId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (supplementId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateCartQuantity(supplementId, currentQuantity - 1);
    } else {
      handleRemoveItem(supplementId);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para comprar');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Error', 'Tu carrito está vacío');
      return;
    }

    let newOrderId: string | null = null;

    try {
      setProcessing(true);

      // Preparar items para la orden
      const items = cart.map(item => ({
        productId: item.supplement.id,
        quantity: item.quantity,
        price: item.supplement.price,
      }));

      // Crear la orden
      newOrderId = await ordersApi.createOrder(user.id, cartTotal, items);
      if (!newOrderId) {
        throw new Error('No se pudo crear la orden');
      }

      setOrderId(newOrderId);

      // Crear payment intent
      const paymentData = await ordersApi.createPaymentIntent(user.id, cartTotal, items);
      if (!paymentData) {
        throw new Error('No se pudo crear el payment intent');
      }

      // Actualizar orden con payment intent ID
      await ordersApi.updateOrderWithPaymentIntent(newOrderId, paymentData.paymentIntentId);

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
        // Verificar si fue cancelado por el usuario
        if (paymentResponse.error.code === 'Canceled') {
          // Eliminar la orden creada
          if (newOrderId) {
            await ordersApi.deleteOrder(newOrderId);
          }
          
          Alert.alert('Compra cancelada', 'La compra fue cancelada por el usuario');
          return;
        }
        
        throw new Error('Payment failed: ' + paymentResponse.error.message);
      }

      // Confirmar el pago
      await ordersApi.confirmOrderPayment(newOrderId);
      clearCart();

      // Agregar notificación de compra exitosa
      await addNotification({
        id: `order-success-${newOrderId}`,
        title: '¡Compra completada!',
        message: `Tu orden por $${cartTotal.toFixed(2)} fue procesada exitosamente`,
        type: 'order',
        date: new Date().toISOString(),
        read: false,
        data: { order_id: newOrderId },
      });

      Alert.alert('Éxito', 'Tu compra se completó correctamente', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Store' as never, { screen: 'StoreList' } as never);
          },
        },
      ]);
    } catch (error) {
      // Si hay error y fue creada la orden, eliminarla
      if (newOrderId) {
        await ordersApi.deleteOrder(newOrderId);
      }
      
      console.error('Error during checkout:', error);
      Alert.alert('Error en el pago', error instanceof Error ? error.message : 'Hubo un error procesando tu compra');
    } finally {
      setProcessing(false);
      setOrderId(null);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const itemTotal = item.supplement.price * item.quantity;

    return (
      <View style={[styles.cartItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Image
          source={{ uri: item.supplement.image }}
          style={styles.itemImage}
          resizeMode="cover"
        />

        <View style={styles.itemDetails}>
          <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
            {item.supplement.name}
          </Text>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>
            ${item.supplement.price.toFixed(2)}
          </Text>

          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: colors.border }]}
              onPress={() => handleDecreaseQuantity(item.supplement.id, item.quantity)}
            >
              <Ionicons name="remove" size={16} color={colors.primary} />
            </TouchableOpacity>

            <Text style={[styles.quantityText, { color: colors.text }]}>
              {item.quantity}
            </Text>

            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: colors.border }]}
              onPress={() => handleIncreaseQuantity(item.supplement.id, item.quantity)}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
            </TouchableOpacity>

            <Text style={[styles.itemTotal, { color: colors.text }]}>
              Total: ${itemTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleRemoveItem(item.supplement.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Carrito vacío
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Agrega productos para comenzar a comprar
      </Text>
      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Store' as never, { screen: 'StoreList' } as never)}
      >
        <Ionicons name="storefront-outline" size={20} color="#fff" />
        <Text style={styles.browseButtonText}>Ver tienda</Text>
      </TouchableOpacity>
    </View>
  );

  if (cart.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Mi Carrito
          </Text>
        </View>
        <EmptyCart />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Mi Carrito ({cart.length})
        </Text>
      </View>

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.supplement.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.totalSection}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            Subtotal:
          </Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            ${cartTotal.toFixed(2)}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.primary }]}
            onPress={() => {
              Alert.alert('Limpiar carrito', '¿Deseas eliminar todos los productos?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar',
                  style: 'destructive',
                  onPress: () => clearCart(),
                },
              ]);
            }}
            disabled={processing}
          >
            <Ionicons name="trash-outline" size={18} color={colors.primary} />
            <Text style={[styles.clearButtonText, { color: colors.primary }]}>
              Limpiar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.primary, opacity: processing ? 0.6 : 1 }]}
            onPress={handleCheckout}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" size={18} />
            ) : (
              <>
                <Text style={styles.checkoutButtonText}>Comprar</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  listContainer: {
    padding: 12,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  deleteButton: {
    marginLeft: 8,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  browseButton: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutButton: {
    flex: 1.5,
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;