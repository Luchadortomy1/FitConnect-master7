import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { createPaymentIntent } from '@/config/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useAppDialog } from '@/hooks/useAppDialog';

interface StripePaymentProps {
  planName: string;
  amount: number;
  planId: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  colors: any;
}

export const StripePaymentSheet = ({
  planName,
  amount,
  planId,
  onSuccess,
  onCancel,
  colors,
}: StripePaymentProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { Dialog, showDialog } = useAppDialog();

  const handlePayment = async () => {
    if (!user?.id) {
      showDialog('Error', 'Usuario no autenticado', { tone: 'error' });
      return;
    }

    setLoading(true);
    try {
      // 1. Crear payment intent en el backend
      const clientSecret = await createPaymentIntent(
        amount,
        planId,
        user.id
      );

      console.log('Client secret received:', clientSecret);

      // 2. Inicializar el PaymentSheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'FitConnect',
        returnURL: 'fitconnect://payment-complete',
        merchantCountryCode: 'US',
        appearance: {
          colors: {
            primary: colors.primary,
            background: colors.background,
            componentBackground: colors.surface,
            componentBorder: colors.border,
            componentText: colors.text,
            placeholderText: colors.textSecondary,
          },
        },
      });

      if (initError) {
        console.error('Init PaymentSheet error:', initError);
        showDialog('Error', 'Error al inicializar el formulario de pago', { tone: 'error' });
        setLoading(false);
        return;
      }

      // 3. Presentar el PaymentSheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // Si el usuario cancela, simplemente cerramos sin error
        if (presentError.code === 'Canceled') {
          console.log('Usuario canceló el pago');
          onCancel();
          setLoading(false);
          return;
        }
        
        console.error('Present PaymentSheet error:', presentError);
        showDialog('Error', presentError.message || 'Error al procesar el pago', { tone: 'error' });
        setLoading(false);
        return;
      }

      // 4. Pago exitoso - extraer payment intent ID del clientSecret
      const paymentIntentId = clientSecret.split('_secret_')[0];

      showDialog('¡Éxito!', 'Tu suscripción se ha completado correctamente', {
        tone: 'success',
        primary: {
          label: 'OK',
          onPress: () => onSuccess(paymentIntentId),
        },
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      showDialog('Error', error.message || 'Error al procesar el pago', { tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Dialog />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={60} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {planName}
        </Text>
        
        <Text style={[styles.amountText, { color: colors.primary }]}>
          ${(amount / 100).toFixed(2)}/mes
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Completa tu suscripción para acceder a todos los beneficios
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.payButton, { backgroundColor: colors.primary }]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>Pagar ${(amount / 100).toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  payButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
