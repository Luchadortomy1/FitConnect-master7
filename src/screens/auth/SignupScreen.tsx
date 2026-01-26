import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Input } from '@/components';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';

const SignupScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await signup(formData.email, formData.password, formData.name);
      if (result.success) {
        if (result.profileError) {
          Alert.alert('Perfil', 'No pudimos guardar tu perfil. Intenta de nuevo.');
        }

        if (result.needsConfirmation) {
          Alert.alert(
            'Confirmación requerida',
            'Te hemos enviado un email de confirmación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Login' as never)
              }
            ]
          );
        } else {
          // Navigate to main app after successful signup
          navigation.navigate('Main' as never);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.xl,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    logo: {
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
    logoText: {
      fontSize: 28,
      fontWeight: '700',
      fontFamily: 'Inter',
      color: '#FFFFFF',
    },
    title: {
      ...Typography.h1,
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    subtitle: {
      ...Typography.body1,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    formContainer: {
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    linkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Spacing.md,
    },
    linkText: {
      ...Typography.body2,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="barbell" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Únete a FitConnect y lleva tu progreso</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Nombre completo"
            value={formData.name}
            onChangeText={updateFormData('name')}
            placeholder="Tu nombre"
            error={errors.name}
            leftIcon={<Ionicons name="person-outline" size={18} color={colors.textSecondary} />}
          />

          <Input
            label="Correo electrónico"
            value={formData.email}
            onChangeText={updateFormData('email')}
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSecondary} />}
          />

          <Input
            label="Contraseña"
            value={formData.password}
            onChangeText={updateFormData('password')}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />}
          />

          <Input
            label="Confirmar contraseña"
            value={formData.confirmPassword}
            onChangeText={updateFormData('confirmPassword')}
            placeholder="Repite tu contraseña"
            secureTextEntry
            error={errors.confirmPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />}
          />

          <Button
            title="Crear cuenta"
            onPress={handleSignup}
            loading={loading}
            fullWidth
          />

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignupScreen;