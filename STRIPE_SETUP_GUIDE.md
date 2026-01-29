# Configuración de Stripe con Supabase

## Paso 1: Obtén tu Stripe Secret Key

1. Ve a [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Busca tu **Secret Key** (comienza con `sk_test_`)
3. Cópiala (es sensible, no la compartas)

## Paso 2: Crear Supabase Edge Function

### Opción A: Usar CLI de Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# En la carpeta del proyecto, crear la función
supabase functions new create-payment-intent

# Reemplazar el contenido de supabase/functions/create-payment-intent/index.ts con:
```

### Opción B: Crear manualmente en Supabase Dashboard

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Ve a Edge Functions → Create New Function
3. Nombre: `create-payment-intent`
4. Copia el código de abajo

## Código de la Edge Function

```typescript
// supabase/functions/create-payment-intent/index.ts

import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    }});
  }

  if (req.method !== 'POST') {
    return new Response('Not allowed', { status: 405 });
  }

  try {
    const { amount, planId, userId } = await req.json();

    if (!amount || !planId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        planId,
        userId,
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
});
```

## Paso 3: Configurar Secret en Supabase

1. En Supabase Dashboard, ve a Project Settings → Secrets
2. Crea una nueva secret:
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_test_YOUR_SECRET_KEY_HERE`

## Paso 4: Deploy la función

Si usaste CLI:
```bash
supabase functions deploy create-payment-intent
```

Si la creaste manualmente, ya está desplegada.

## Testing con tarjetas de prueba de Stripe

Usa estas tarjetas para testing:

- **Tarjeta exitosa**: 4242 4242 4242 4242
- **Tarjeta rechazada**: 4000 0000 0000 0002
- **Fecha**: Cualquier fecha futura (ej: 12/25)
- **CVC**: Cualquier número (ej: 123)

## Verificación

Para verificar que funciona:

1. Abre tu app en Expo
2. Ve a la pantalla de Gyms
3. Selecciona un gimnasio
4. Haz clic en Subscribe
5. Selecciona un plan
6. Ingresa los datos de tarjeta de prueba
7. Haz clic en Pagar

Si ves "¡Éxito!", entonces funciona correctamente.

## Troubleshooting

Si tienes errores:

1. Verifica que tu Secret Key esté configurada en Supabase
2. Revisa los logs de la Edge Function en Supabase Dashboard
3. Asegúrate de que la URL de Supabase en stripe.ts sea correcta
4. Comprueba que el Publishable Key sea de test mode (pk_test_)
