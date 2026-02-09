import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return new Response('Not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { amount, userId, type, planId, items } = body;

    // Validar datos comunes
    if (!amount || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, userId', code: 400 }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const metadata: Record<string, string> = {
      userId,
      type: type || 'subscription',
    };

    // Agregar metadata según el tipo
    if (type === 'subscription' && planId) {
      metadata.planId = planId;
    } else if (type === 'order' && items) {
      metadata.itemCount = items.length.toString();
    }

    console.log('Creating payment intent for:', { amount, userId, type, metadata });

    // Crear payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Ya está en centavos (enviado desde el cliente)
      currency: 'usd',
      metadata,
    });

    console.log('Payment intent created:', paymentIntent.id);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 500
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
