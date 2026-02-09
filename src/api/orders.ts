import { supabase } from './auth';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'failed';
  stripe_payment_intent_id: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
}

export const ordersApi = {
  /**
   * Crear un payment intent para una orden
   */
  async createPaymentIntent(
    userId: string,
    totalAmount: number,
    items: Array<{ productId: string; quantity: number; price: number }>
  ): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
    try {
      const response = await fetch(
        'https://tpruptccnvsnyqrjbags.supabase.co/functions/v1/rapid-task',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(totalAmount * 100), // Stripe usa centavos
            userId,
            type: 'order',
            items,
          }),
        }
      );

      if (!response.ok) {
        console.error('Error creating payment intent:', response.statusText);
        return null;
      }

      const data = await response.json();
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  },

  /**
   * Crear una orden pending
   */
  async createOrder(
    userId: string,
    totalAmount: number,
    items: Array<{ productId: string; quantity: number; price: number }>
  ): Promise<string | null> {
    try {
      // Crear la orden
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select('id')
        .single();

      if (orderError || !orderData) {
        console.error('Error creating order:', orderError);
        return null;
      }

      const orderId = orderData.id;

      // Crear los order items
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_purchase: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Eliminar la orden si hay error
        await supabase.from('orders').delete().eq('id', orderId);
        return null;
      }

      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  },

  /**
   * Actualizar orden con payment intent ID
   */
  async updateOrderWithPaymentIntent(
    orderId: string,
    paymentIntentId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ stripe_payment_intent_id: paymentIntentId })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      return false;
    }
  },

  /**
   * Confirmar pago de orden (cambiar status a paid)
   */
  async confirmOrderPayment(orderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId);

      if (error) {
        console.error('Error confirming order payment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error confirming order payment:', error);
      return false;
    }
  },

  /**
   * Obtener órdenes del usuario
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  /**
   * Obtener detalles de una orden
   */
  async getOrderDetails(orderId: string): Promise<{ order: Order | null; items: OrderItem[] }> {
    try {
      const [orderRes, itemsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single(),
        supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId),
      ]);

      if (orderRes.error) {
        console.error('Error fetching order:', orderRes.error);
        return { order: null, items: [] };
      }

      return {
        order: orderRes.data,
        items: itemsRes.data || [],
      };
    } catch (error) {
      console.error('Error fetching order details:', error);
      return { order: null, items: [] };
    }
  },

  /**
   * Eliminar una orden y sus items
   */
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      // Primero eliminar order_items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
        return false;
      }

      // Luego eliminar la orden
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) {
        console.error('Error deleting order:', orderError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  },
};
