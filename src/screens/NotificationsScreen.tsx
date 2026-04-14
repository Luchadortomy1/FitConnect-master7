import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Notification } from '@/types';
import { gymsApi } from '@/api';
import { Header } from '@/components/Header';

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const { notifications, markNotificationAsRead, deleteNotification, loadNotifications } = useApp();
  const navigation = useNavigation();

  // Load notifications when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          await loadNotifications();
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      };
      loadData();
    }, [loadNotifications])
  );

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    try {
      // Get root navigation
      const rootNav = navigation.getParent();
      if (!rootNav) return;

      // Navigate based on notification type
      if ((notification.type === 'subscription' || notification.type === 'general') && notification.data?.gym_id) {
        // Navigate to gym detail
        const gym = await gymsApi.getGym(notification.data.gym_id);
        if (gym) {
          rootNav.navigate('Main' as never, {
            screen: 'Gyms',
            params: {
              screen: 'GymDetail',
              params: { gym },
              initial: false
            }
          } as never);
        }
      } else if (notification.type === 'supplement' && notification.data?.product_id) {
        // Navigate to product detail
        rootNav.navigate('Main' as never, {
          screen: 'Store',
          params: {
            screen: 'ProductDetail',
            params: { productId: notification.data.product_id },
            initial: false
          }
        } as never);
      } else if (notification.type === 'order') {
        const orderId = (notification.data?.order_id || notification.data?.orderId) as string | undefined;

        if (!orderId) {
          Alert.alert('Orden no disponible', 'No se encontró el identificador de la orden en esta notificación.');
          return;
        }

        // Navigate directly to receipt inside the Store stack
        rootNav.navigate('Main' as never, {
          screen: 'Store',
          params: {
            screen: 'Receipt',
            params: { orderId },
            initial: false,
          },
        } as never);
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
    }
  };

  const handleLongPressNotification = (notification: Notification) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Deseas eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteNotification(notification.id);
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return 'barbell';
      case 'supplement':
        return 'flask';
      case 'achievement':
        return 'trophy';
      case 'subscription':
        return 'card';
      case 'order':
        return 'checkmark-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'workout':
        return '#FF6B6B';
      case 'supplement':
        return '#4ECDC4';
      case 'achievement':
        return '#FFD93D';
      case 'subscription':
        return '#A78BFA';
      case 'order':
        return '#A8E6CF';
      default:
        return colors.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.read ? colors.surface : colors.surface + '99',
            borderLeftColor: iconColor,
          },
        ]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleLongPressNotification(item)}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconColor + '20' },
          ]}
        >
          <Ionicons name={getNotificationIcon(item.type)} size={24} color={iconColor} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && (
              <View style={[styles.unreadDot, { backgroundColor: iconColor }]} />
            )}
          </View>
          <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  const EmptyNotifications = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Sin notificaciones
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Aquí verás tus recordatorios de entrenamientos, ofertas y actualizaciones
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Notificaciones" showBack />

      {notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  message: {
    fontSize: 13,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
  },
  chevron: {
    marginLeft: 8,
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
});

export default NotificationsScreen;