import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing } from '@/constants/theme';

const AuthLoadingScreen: React.FC = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
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
    loadingText: {
      ...Typography.body1,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>FC</Text>
        </View>
      </View>
      
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>
        Iniciando FitConnect...
      </Text>
    </View>
  );
};

export default AuthLoadingScreen;