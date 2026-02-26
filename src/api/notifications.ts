import { Notification } from '@/types';
import { supabase } from './auth';

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
  async createNotification(notification: Omit<Notification, 'id'>): Promise<Notification | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No user logged in');
        return null;
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
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
};
