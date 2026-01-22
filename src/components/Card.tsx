import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing, Shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  shadow = true,
}) => {
  const { colors } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[padding],
    borderWidth: 1,
    borderColor: colors.border,
    ...(shadow ? Shadows.light : {}),
    ...style,
  };

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  const { colors } = useTheme();

  const titleStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: subtitle ? 4 : 0,
  };

  const subtitleStyle: TextStyle = {
    fontSize: 14,
    color: colors.textSecondary,
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={titleStyle}>{title}</Text>
        {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
      </View>
      {action && <View>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
});