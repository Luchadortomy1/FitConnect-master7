import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useNavigation } from '@react-navigation/native';
import { Notification } from '@/types';
import { gymsApi } from '@/api';

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const { notifications, markNotificationAsRead } = useApp();
  const navigation = useNavigation();

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Navigate if subscription notification
    if (notification.type === 'subscription' && notification.data?.gym_id) {
      try {
        const gym = await gymsApi.getGym(notification.data.gym_id);
        if (gym) {
          // Navigate to parent (RootStack) first, then to Gyms
          const parentNav = navigation.getParent();
          parentNav?.navigate('Main' as never, {
            screen: 'Gyms',
            params: { screen: 'GymDetail', params: { gym } }
          } as never);
        }
      } catch (error) {
        console.error('Error loading gym:', error);
      }
    }
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
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Notificaciones
        </Text>
      </View>

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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
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