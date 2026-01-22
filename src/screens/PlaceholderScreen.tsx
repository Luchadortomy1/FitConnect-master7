import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography } from '@/constants/theme';

const PlaceholderScreen: React.FC<{ title: string }> = ({ title }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    title: {
      ...Typography.h2,
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      ...Typography.body1,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>This screen is coming soon!</Text>
    </View>
  );
};

export default PlaceholderScreen;