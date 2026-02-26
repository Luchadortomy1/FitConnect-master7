import { supabase } from './auth';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  stripe_payment_id?: string;
  created_at: string;
  gym_id?: string;
  gym_name?: string;
  plan_name?: string;
  plan_price?: number;
}

export const userSubscriptionsApi = {
  /**
   * Obtener suscripción activa del usuario
   */
  async getUserActiveSubscription(): Promise<UserSubscription | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.warn('No active session');
        return null;
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          plan_id,
          start_date,
          end_date,
          status,
          stripe_payment_id,
          created_at,
          subscription_plans(
            id,
            gym_id,
            name,
            price,
            gyms(
              id,
              name
            )
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Mapear respuesta a interfaz UserSubscription
      const plan = data.subscription_plans as any;
      const gym = plan?.gyms;

      return {
        id: data.id,
        user_id: data.user_id,
        plan_id: data.plan_id,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        stripe_payment_id: data.stripe_payment_id,
        created_at: data.created_at,
        gym_id: gym?.id,
        gym_name: gym?.name,
        plan_name: plan?.name,
        plan_price: plan?.price,
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  },

  /**
   * Suscribir usuario a un plan
   */
  async subscribeToGym(planId: string, stripePaymentId?: string): Promise<UserSubscription | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('No authenticated user');
      }

      // Obtener datos del plan
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*, gyms(id, name)')
        .eq('id', planId)
        .single();

      if (planError || !planData) {
        throw new Error('Plan not found');
      }

      // Calcular fecha de vencimiento
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + planData.duration_days);

      // Crear o actualizar suscripción
      const subscriptionData: any = {
        user_id: session.user.id,
        plan_id: planId,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
      };

      // Agregar stripe_payment_id si está disponible
      if (stripePaymentId) {
        subscriptionData.stripe_payment_id = stripePaymentId;
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert(subscriptionData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const gym = planData.gyms as any;
      return {
        id: data.id,
        user_id: data.user_id,
        plan_id: data.plan_id,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        stripe_payment_id: data.stripe_payment_id,
        created_at: data.created_at,
        gym_id: gym?.id,
        gym_name: gym?.name,
        plan_name: planData.name,
        plan_price: planData.price,
      };
    } catch (error) {
      console.error('Error subscribing to gym:', error);
      return null;
    }
  },

  /**
   * Renovar suscripción del usuario (extender fecha de vencimiento)
   */
  async renewSubscription(subscriptionId: string, stripePaymentId?: string): Promise<UserSubscription | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('No authenticated user');
      }

      // Obtener la suscripción actual
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(duration_days, gyms(id, name), name, price)')
        .eq('id', subscriptionId)
        .eq('user_id', session.user.id)
        .single();

      if (subError || !subscription) {
        throw new Error('Subscription not found');
      }

      const plan = subscription.subscription_plans as any;
      const currentEndDate = new Date(subscription.end_date);
      const newEndDate = new Date(currentEndDate.getTime() + (plan.duration_days * 24 * 60 * 60 * 1000));

      // Actualizar suscripción con nueva fecha de vencimiento
      const updateData: any = {
        end_date: newEndDate.toISOString(),
        status: 'active',
      };

      if (stripePaymentId) {
        updateData.stripe_payment_id = stripePaymentId;
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(updateData)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const gym = plan?.gyms;
      return {
        id: data.id,
        user_id: data.user_id,
        plan_id: data.plan_id,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        stripe_payment_id: data.stripe_payment_id,
        created_at: data.created_at,
        gym_id: gym?.id,
        gym_name: gym?.name,
        plan_name: plan?.name,
        plan_price: plan?.price,
      };
    } catch (error) {
      console.error('Error renewing subscription:', error);
      return null;
    }
  },

  /**
   * Obtener todas las suscripciones del usuario (activas, expiradas, canceladas)
   */
  async getUserAllSubscriptions(): Promise<UserSubscription[]> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.warn('No active session');
        return [];
      }

      // Primero, marcar como expiradas las que pasaron su fecha
      const now = new Date().toISOString();
      await supabase
        .from('user_subscriptions')
        .update({ status: 'expired' })
        .eq('user_id', session.user.id)
        .lt('end_date', now)
        .neq('status', 'expired')
        .neq('status', 'cancelled');

      // Luego, obtener todas las suscripciones
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          plan_id,
          start_date,
          end_date,
          status,
          stripe_payment_id,
          created_at,
          subscription_plans(
            id,
            gym_id,
            name,
            price,
            gyms(
              id,
              name
            )
          )
        `)
        .eq('user_id', session.user.id)
        .in('status', ['active', 'expired']);

      if (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Mapear respuestas a interfaz UserSubscription
      return data.map((subscription: any) => {
        const plan = subscription.subscription_plans as any;
        const gym = plan?.gyms;

        return {
          id: subscription.id,
          user_id: subscription.user_id,
          plan_id: subscription.plan_id,
          start_date: subscription.start_date,
          end_date: subscription.end_date,
          status: subscription.status,
          stripe_payment_id: subscription.stripe_payment_id,
          created_at: subscription.created_at,
          gym_id: gym?.id,
          gym_name: gym?.name,
          plan_name: plan?.name,
          plan_price: plan?.price,
        };
      });
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      return [];
    }
  },

  /**
   * Obtener todas las suscripciones activas del usuario
   */
  async getUserAllActiveSubscriptions(): Promise<UserSubscription[]> {
    try {
      const subscriptions = await this.getUserAllSubscriptions();
      // Filtrar solo las activas
      return subscriptions.filter(sub => sub.status === 'active');
    } catch (error) {
      console.error('Error getting active subscriptions:', error);
      return [];
    }
  },

  /**
   * Cancelar suscripción del usuario
   */
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  },
};
