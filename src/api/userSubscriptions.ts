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
  auto_renew?: boolean;
  cancel_at_period_end?: boolean;
  cancellation_requested_at?: string | null;
}

const mapSubscription = (subscription: any): UserSubscription => {
  const plan = subscription.subscription_plans;
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
    auto_renew: Boolean(subscription.auto_renew),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    cancellation_requested_at: subscription.cancellation_requested_at || null,
  };
};

const isStillActiveByDate = (endDateIso?: string): boolean => {
  if (!endDateIso) return false;
  return new Date(endDateIso).getTime() > Date.now();
};

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
          *,
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

      return mapSubscription(data);
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

      const gym = planData.gyms;
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
        auto_renew: false,
        cancel_at_period_end: false,
        cancellation_requested_at: null,
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

      const plan = subscription.subscription_plans;
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

      // Si existiera el esquema extendido, al renovar removemos la cancelación programada.
      await supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: false,
          cancellation_requested_at: null,
        })
        .eq('id', subscriptionId);

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
        auto_renew: Boolean(data.auto_renew),
        cancel_at_period_end: false,
        cancellation_requested_at: null,
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

      // Procesar renovación automática para suscripciones con facturación periódica activa.
      // Si el esquema extendido no existe aún, este bloque se omite sin romper el flujo.
      const nowIso = new Date().toISOString();
      const { data: pendingAutoRenewals, error: autoRenewError } = await supabase
        .from('user_subscriptions')
        .select('id, end_date, subscription_plans(duration_days)')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .eq('auto_renew', true)
        .lt('end_date', nowIso);

      if (!autoRenewError && pendingAutoRenewals && pendingAutoRenewals.length > 0) {
        for (const sub of pendingAutoRenewals as any[]) {
          const durationDays = sub?.subscription_plans?.duration_days;
          if (!durationDays || !sub?.end_date) continue;

          let nextEndDate = new Date(sub.end_date);
          const nowTime = Date.now();

          // Cubre escenarios donde el usuario estuvo inactivo varios periodos.
          while (nextEndDate.getTime() <= nowTime) {
            nextEndDate = new Date(nextEndDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
          }

          await supabase
            .from('user_subscriptions')
            .update({
              end_date: nextEndDate.toISOString(),
              status: 'active',
              cancel_at_period_end: false,
              cancellation_requested_at: null,
            })
            .eq('id', sub.id);
        }
      } else if (autoRenewError) {
        console.warn('Auto-renew check skipped:', autoRenewError.message);
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
          *,
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

      return data.map((subscription: any) => mapSubscription(subscription));
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
      // Filtrar solo las activas y no vencidas por fecha.
      return subscriptions.filter(sub => sub.status === 'active' && isStillActiveByDate(sub.end_date));
    } catch (error) {
      console.error('Error getting active subscriptions:', error);
      return [];
    }
  },

  /**
   * Activar o desactivar facturación periódica (renovación automática).
   * Requiere columnas opcionales en BD: auto_renew, cancel_at_period_end, cancellation_requested_at.
   */
  async setRecurringBilling(subscriptionId: string, enabled: boolean): Promise<boolean> {
    try {
      const payload: any = { auto_renew: enabled };

      if (enabled) {
        payload.cancel_at_period_end = false;
        payload.cancellation_requested_at = null;
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update(payload)
        .eq('id', subscriptionId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating recurring billing:', error);
      return false;
    }
  },

  /**
   * Cancelar suscripción del usuario.
   * Por defecto cancela al finalizar el periodo actual para no perder días ya pagados.
   */
  async cancelSubscription(subscriptionId: string, options?: { immediate?: boolean }): Promise<boolean> {
    try {
      const immediate = Boolean(options?.immediate);

      if (immediate) {
        const { error } = await supabase
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', subscriptionId);

        if (error) {
          throw error;
        }

        return true;
      }

      const { data: subscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('id, status, end_date')
        .eq('id', subscriptionId)
        .single();

      if (subscriptionError || !subscription) {
        throw subscriptionError || new Error('Subscription not found');
      }

      const shouldKeepActive =
        subscription.status === 'active' && isStillActiveByDate(subscription.end_date);

      if (shouldKeepActive) {
        const { error: scheduleError } = await supabase
          .from('user_subscriptions')
          .update({
            auto_renew: false,
            cancel_at_period_end: true,
            cancellation_requested_at: new Date().toISOString(),
          })
          .eq('id', subscriptionId);

        // Si la BD todavía no tiene columnas de cancelación programada,
        // no forzamos status=cancelled para conservar acceso hasta vencimiento.
        if (scheduleError) {
          console.warn('Scheduled cancellation fields unavailable, keeping active subscription as-is:', scheduleError.message);
        }

        return true;
      }

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
