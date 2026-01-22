import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Input } from '@/components';
import { Typography, Spacing } from '@/constants/theme';

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
      padding: Spacing.lg,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: Spacing.xxl,
    },
    logo: {
      width: 80,
      height: 80,
      backgroundColor: colors.primary,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    logoText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    title: {
      ...Typography.h2,
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    subtitle: {
      ...Typography.body1,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    formContainer: {
      marginBottom: Spacing.xl,
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
            <Text style={styles.logoText}>FC</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join FitConnect and start your fitness journey</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={updateFormData('name')}
            placeholder="Enter your full name"
            error={errors.name}
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={updateFormData('email')}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            value={formData.password}
            onChangeText={updateFormData('password')}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={updateFormData('confirmPassword')}
            placeholder="Confirm your password"
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            fullWidth
          />

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignupScreen;