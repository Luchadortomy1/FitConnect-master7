import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/api/auth';
import { useApp } from '@/contexts/AppContext';

/**
 * Hook that listens for new gyms and products in real-time
 * and automatically creates notifications
 * 
 * TEMPORARILY DISABLED - Causing issues
 */
export const useNotificationRealtimeListener = () => {
  // Disabled for now - uncomment when ready to use
  /*
  const { addNotification } = useApp();

  useEffect(() => {
    let gymsChannel: RealtimeChannel | null = null;
    let productsChannel: RealtimeChannel | null = null;

    const setupListeners = async () => {
      try {
        // Listen for new gyms
        gymsChannel = supabase
          .channel('public:gyms')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'gyms',
            },
            (payload) => {
              const newGym = payload.new as any;

              // Create notification for new gym
              if (newGym?.id && newGym?.name) {
                addNotification({
                  id: `gym-new-realtime-${newGym.id}-${Date.now()}`,
                  title: '🏋️ Nuevo Gimnasio Disponible',
                  message: `Se ha añadido un nuevo gimnasio: ${newGym.name}`,
                  date: new Date().toISOString(),
                  read: false,
                  type: 'general',
                  data: { gym_id: newGym.id, gym_name: newGym.name },
                });
              }
            }
          )
          .subscribe();

        // Listen for new products
        productsChannel = supabase
          .channel('public:products')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'products',
            },
            async (payload) => {
              const newProduct = payload.new as any;

              // Get gym info and create notification if user is subscribed
              if (newProduct?.id && newProduct?.gym_id) {
                try {
                  const { data: gym } = await supabase
                    .from('gyms')
                    .select('name')
                    .eq('id', newProduct.gym_id)
                    .single();

                  if (gym) {
                    addNotification({
                      id: `product-new-realtime-${newProduct.id}-${Date.now()}`,
                      title: `💪 Nuevo Suplemento en ${gym.name}`,
                      message: `Se ha añadido: ${newProduct.name} por $${newProduct.price}`,
                      date: new Date().toISOString(),
                      read: false,
                      type: 'supplement',
                      data: {
                        product_id: newProduct.id,
                        product_name: newProduct.name,
                        gym_id: newProduct.gym_id,
                        price: newProduct.price,
                      },
                    });
                  }
                } catch (error) {
                  console.error('Error fetching gym for product notification:', error);
                }
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error setting up realtime listeners:', error);
      }
    };

    setupListeners();

    // Cleanup
    return () => {
      if (gymsChannel) {
        supabase.removeChannel(gymsChannel);
      }
      if (productsChannel) {
        supabase.removeChannel(productsChannel);
      }
    };
  }, [addNotification]);
  */
};
