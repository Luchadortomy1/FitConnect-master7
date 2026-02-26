import { Notification } from '@/types';
import type { UserSubscription } from '@/api/userSubscriptions';

/**
 * Check subscription expiration and generate notifications
 * Returns notifications that should be shown to the user
 */
export const checkSubscriptionNotifications = (
  subscriptions: UserSubscription[]
): Notification[] => {
  const notifications: Notification[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  subscriptions.forEach((subscription) => {
    const endDate = new Date(subscription.end_date);
    endDate.setHours(0, 0, 0, 0);

    const daysUntilExpiration = Math.floor(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const gymName = subscription.gym_name || 'Suscripción';
    const planName = subscription.plan_name || 'Plan Premium';

    // Notification for expiring subscription (3 days before)
    if (daysUntilExpiration === 3 && subscription.status === 'active') {
      notifications.push({
        id: `exp-3days-${subscription.id}`,
        title: '⏰ Tu suscripción vence pronto',
        message: `Tu suscripción a ${gymName} (${planName}) vence en 3 días`,
        date: today.toISOString(),
        read: false,
        type: 'subscription',
        data: { gym_id: subscription.gym_id, subscription_id: subscription.id },
      });
    }

    // Notification for expiring subscription (1 day before)
    if (daysUntilExpiration === 1 && subscription.status === 'active') {
      notifications.push({
        id: `exp-1day-${subscription.id}`,
        title: '⚠️ Tu suscripción vence mañana',
        message: `¡Última oportunidad! Tu suscripción a ${gymName} (${planName}) vence mañana`,
        date: today.toISOString(),
        read: false,
        type: 'subscription',
        data: { gym_id: subscription.gym_id, subscription_id: subscription.id },
      });
    }

    // Notification for expired subscription (on expiration day or after)
    // Changed from === 0 to <= 0 to catch any subscriptions that have expired
    if (daysUntilExpiration <= 0 && subscription.status === 'active') {
      notifications.push({
        id: `expired-${subscription.id}`,
        title: '❌ Tu suscripción expiró',
        message: `Tu suscripción a ${gymName} (${planName}) ha expirado. ¿Quieres renovarla?`,
        date: today.toISOString(),
        read: false,
        type: 'subscription',
        data: { gym_id: subscription.gym_id, subscription_id: subscription.id },
      });
    }

    // Notification when subscription status is already marked as expired
    if (subscription.status === 'expired' && daysUntilExpiration <= 0) {
      notifications.push({
        id: `expired-inactive-${subscription.id}`,
        title: '🔔 Tu suscripción expiró',
        message: `Tu suscripción a ${gymName} no está activa. Renuévala para acceder nuevamente`,
        date: today.toISOString(),
        read: false,
        type: 'subscription',
        data: { gym_id: subscription.gym_id, subscription_id: subscription.id },
      });
    }
  });

  return notifications;
};
