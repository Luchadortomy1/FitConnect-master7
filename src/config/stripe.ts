// Stripe Configuration
// Get your keys from https://dashboard.stripe.com/apikeys

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SruvmChfM5PXjpVbyEtPEFRFRU17ydCAEGlukriEvR1Q98Uo0MKlXzcYLuBgwE3wYib4ytWg0dL4UNhSwlIxDoQ00QjZY5mc3';

// Tu URL de Supabase (reemplaza con la tuya)
const SUPABASE_URL = 'https://tpruptccnvsnyqrjbags.supabase.co';
export const STRIPE_BACKEND_URL = `${SUPABASE_URL}/functions/v1/rapid-task`;

// Function to create a payment intent on your Supabase Edge Function
export const createPaymentIntent = async (amount: number, planId: string, userId: string, token?: string) => {
  try {
    console.log('Creating payment intent with URL:', STRIPE_BACKEND_URL);
    console.log('Request body:', { amount, planId, userId });
    
    const headers: any = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(STRIPE_BACKEND_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount,
        planId,
        userId,
      }),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      const error = data.error || data.message || 'Failed to create payment intent';
      throw new Error(error);
    }

    if (!data.clientSecret) {
      throw new Error('No clientSecret in response');
    }

    return data.clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Save subscription to Supabase after successful payment
export const saveSubscriptionPayment = async (
  supabase: any,
  userId: string,
  planId: string,
  paymentIntentId: string
) => {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días desde hoy
        status: 'active',
        stripe_payment_id: paymentIntentId,
      })
      .select()
      .single();

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }
};
