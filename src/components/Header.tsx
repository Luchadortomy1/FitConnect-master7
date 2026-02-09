import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Typography } from '@/constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  rightActions?: Array<{
    icon: React.ReactNode;
    onPress: () => void;
    accessibilityLabel?: string;
  }>;
  backgroundColor?: string;
  showBorder?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  rightActions,
  backgroundColor,
  showBorder = true,
}) => {
  const { colors } = useTheme();

  const headerStyle: ViewStyle = {
    backgroundColor: backgroundColor || colors.background,
    borderBottomWidth: showBorder ? 1 : 0,
    borderBottomColor: colors.border,
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    minHeight: 65,
  };

  const titleContainerStyle: ViewStyle = {
    flex: 1,
    alignItems: 'flex-start',
  };

  const titleStyle: TextStyle = {
    ...Typography.h2,
    color: colors.text,
    textAlign: 'center',
  };

  const subtitleStyle: TextStyle = {
    ...Typography.h4,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  };

  const actionStyle: ViewStyle = {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const rightStackStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  };

  return (
    <View style={headerStyle}>
      <View style={containerStyle}>
        <View style={actionStyle}>
          {leftAction && (
            <TouchableOpacity
              onPress={leftAction.onPress}
              style={styles.actionButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={leftAction.accessibilityLabel || 'Go back'}
            >
              {leftAction.icon}
            </TouchableOpacity>
          )}
        </View>

        <View style={titleContainerStyle}>
          <Text style={titleStyle}>{title}</Text>
          {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
        </View>

        <View style={actionStyle}>
          {rightAction && !rightActions && (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={styles.actionButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={rightAction.accessibilityLabel || 'Action'}
            >
              {rightAction.icon}
            </TouchableOpacity>
          )}
        </View>

        {rightActions && (
          <View style={rightStackStyle}>
            {rightActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                style={styles.actionButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={action.accessibilityLabel || 'Action'}
              >
                {action.icon}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});