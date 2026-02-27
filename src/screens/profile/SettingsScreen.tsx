import React from 'react';
import { View, StyleSheet } from 'react-native';
import PlaceholderScreen from '../PlaceholderScreen';
import { Header } from '@/components/Header';
import { useTheme } from '@/contexts/ThemeContext';

const SettingsScreen = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Configuración" showBack />
      <PlaceholderScreen title="Settings" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SettingsScreen;