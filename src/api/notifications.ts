import { Notification } from '@/types';
import { supabase } from './auth';
import * as Notifications from 'expo-notifications';

// Función para generar UUID v4
const generateUUID = (): string => {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return uuid;
};

// Configurar el comportamiento de notificaciones push
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationsApi = {
  /**
   * Get all notifications for the current user
   */
  async getUserNotifications(): Promise<Notification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No user logged in');
        return [];
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      // Map database records to Notification type
      return (data || []).map(record => ({
        id: record.id,
        title: record.title,
        message: record.message,
        date: record.date,
        read: record.read,
        type: record.type as 'workout' | 'supplement' | 'general' | 'achievement' | 'subscription',
        data: record.data || {},
      }));
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return [];
    }
  },

  /**
   * Create a new notification for the current user
   */
  async createNotification(notification: Notification): Promise<Notification | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No user logged in');
        return null;
      }

      // Verificar si la notificación ya existe antes de crear
      const existingNotification = await this.notificationExists(notification.id);
      if (existingNotification) {
        console.warn('Notification already exists with id:', notification.id);
        return null;
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            id: notification.id,
            user_id: user.id,
            title: notification.title,
            message: notification.message,
            date: notification.date,
            read: notification.read,
            type: notification.type,
            data: notification.data || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return {
        id: data.id,
        title: data.title,
        message: data.message,
        date: data.date,
        read: data.read,
        type: data.type,
        data: data.data || {},
      };
    } catch (error) {
      console.error('Error in createNotification:', error);
      return null;
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return false;
    }
  },

  /**
   * Check if notification with same ID already exists
   */
  async notificationExists(notificationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('id', notificationId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking notification:', error);
      }

      return !!data;
    } catch (error) {
      console.error('Error in notificationExists:', error);
      return false;
    }
  },

  /**
   * Send push notification for delivery
   */
  async sendDeliveryPushNotification(
    orderNumber: string,
    deliveryDate: string
  ): Promise<boolean> {
    try {
      const formattedDate = new Date(deliveryDate).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ ¡Tu orden fue entregada!',
          body: `Tu orden #${orderNumber} fue entregada el ${formattedDate}`,
          data: {
            orderNumber,
            deliveryDate,
            type: 'delivery',
          },
        },
        trigger: null, // Mostrar inmediatamente
      });

      return true;
    } catch (error) {
      console.error('Error sending delivery push notification:', error);
      return false;
    }
  },

  /**
   * Request notification permissions
   */
  async requestNotificationPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },
};
