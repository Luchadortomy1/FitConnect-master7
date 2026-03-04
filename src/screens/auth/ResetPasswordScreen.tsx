import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { updatePassword } from '@/api/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Input } from '@/components';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const validateForm = () => {
    const newErrors: { password?: string; confirm?: string } = {};
    
    if (!newPassword) {
      newErrors.password = 'La contraseña es requerida';
    } else if (newPassword.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!confirmPassword) {
      newErrors.confirm = 'Confirma tu contraseña';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await updatePassword(newPassword);
      if (result.success) {
        Alert.alert(
          '¡Contraseña actualizada!',
          'Tu contraseña ha sido cambiada exitosamente. Por favor, inicia sesión con tu nueva contraseña.',
          [
            {
              text: 'Iniciar sesión',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Error',
          result.error || 'No se pudo actualizar la contraseña. Intenta de nuevo.'
        );
      }
    } catch (error) {
      console.error('Reset password error:', error);
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
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
    },
    input: {
      flex: 1,
    },
    showPasswordButton: {
      position: 'absolute',
      right: Spacing.md,
      padding: Spacing.sm,
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
            <Ionicons name="lock-closed-outline" size={44} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>
          Crea una nueva contraseña para tu cuenta de FitConnect.
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Input
              style={styles.input}
              placeholder="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Input
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
            secureTextEntry={!showPassword}
          />
          {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Cambiar contraseña"
            onPress={handleResetPassword}
            loading={loading}
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

export default ResetPasswordScreen;
