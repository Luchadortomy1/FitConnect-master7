import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { requestPasswordReset } from '@/api/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Input } from '@/components';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [emailSent, setEmailSent] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestReset = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setEmailSent(true);
        Alert.alert(
          '¡Correo enviado!',
          `Hemos enviado un enlace de recuperación a ${email}. Revisa tu correo electrónico (incluye la carpeta de spam) y haz clic en el enlace para cambiar tu contraseña.`,
          [
            {
              text: 'Entendido',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Error',
          result.error || 'No se pudo enviar el correo de recuperación. Intenta de nuevo.'
        );
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', 'Algo salió mal. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    backButton: {
      padding: Spacing.sm,
      marginLeft: -Spacing.sm,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    icon: {
      width: 88,
      height: 88,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.round,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
      shadowColor: colors.primary,
      shadowOpacity: 0.15,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
    },
    title: {
      ...Typography.h1,
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    subtitle: {
      ...Typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xl,
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: Spacing.lg,
    },
    buttonContainer: {
      marginTop: Spacing.xl,
      gap: Spacing.md,
    },
    errorText: {
      ...Typography.caption,
      color: '#EF4444',
      marginTop: Spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.icon}>
            <Ionicons name="mail-outline" size={44} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para cambiar tu contraseña.
        </Text>

        <View style={styles.inputContainer}>
          <Input
            placeholder="tu@correo.com"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={emailSent ? 'Correo enviado' : 'Enviar enlace'}
            onPress={handleRequestReset}
            loading={loading}
            disabled={emailSent}
          />
          <Button
            title="Volver a iniciar sesión"
            onPress={() => navigation.goBack()}
            variant="secondary"
            disabled={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ForgotPasswordScreen;
