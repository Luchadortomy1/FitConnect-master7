import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/api/auth';
import { Header } from '@/components/Header';

const { width } = Dimensions.get('window');

interface OrderSummary {
  id: string;
  total_amount: number;
  created_at: string;
  status: 'pending' | 'completed' | 'paid' | 'failed';
  gym_id?: string;
  gym_name?: string;
  item_count: number;
}

const OrderHistoryScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Obtener órdenes del usuario
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, created_at, status, gym_id')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setLoading(false);
        return;
      }

      // Procesar órdenes para obtener información adicional
      const processedOrders = await Promise.all(
        ordersData.map(async (order) => {
          // Obtener cantidad de items
          const { data: items } = await supabase
            .from('order_items')
            .select('id')
            .eq('order_id', order.id);

          // Obtener nombre del gym
          let gymName = undefined;
          if (order.gym_id) {
            const { data: gym } = await supabase
              .from('gyms')
              .select('name')
              .eq('id', order.gym_id)
              .single();
            gymName = gym?.name;
          }

          return {
            ...order,
            item_count: items?.length || 0,
            gym_name: gymName,
          };
        })
      );

      setOrders(processedOrders);
    } catch (error) {
      console.error('Error processing orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallida';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return colors.success || '#10B981';
      case 'pending':
        return colors.warning || '#F59E0B';
      case 'failed':
        return colors.error || '#EF4444';
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = ({ item }: { item: OrderSummary }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Receipt' as never, { orderId: item.id } as never)}
        style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={[styles.orderNumber, { color: colors.primary }]}>
              Orden #{item.id.slice(0, 8).toUpperCase()}
            </Text>
            <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
          <View style={styles.orderStatus}>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.orderDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="bag-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.item_count} {item.item_count === 1 ? 'producto' : 'productos'}
            </Text>
          </View>

          {Boolean(item.gym_name) && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.gym_name}
              </Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ${item.total_amount.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
          <Ionicons name="receipt-outline" size={18} color={colors.primary} />
          <Text style={[styles.viewReceiptText, { color: colors.primary }]}>
            Ver comprobante
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyOrders = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bag-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Sin órdenes
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Aún no has realizado ninguna compra
      </Text>
      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Store' as never, { screen: 'StoreList' } as never)}
      >
        <Ionicons name="storefront-outline" size={20} color="#fff" />
        <Text style={styles.browseButtonText}>Ir a la tienda</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header 
          title="Mis Órdenes"
          leftAction={{
            icon: <Ionicons name="chevron-back" size={28} color={colors.text} />,
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando órdenes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title={`Mis Órdenes (${orders.length})`}
        leftAction={{
          icon: <Ionicons name="chevron-back" size={28} color={colors.text} />,
          onPress: () => navigation.goBack(),
        }}
      />

      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  listContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  orderStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  orderDetails: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  viewReceiptText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
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
});

export default OrderHistoryScreen;
