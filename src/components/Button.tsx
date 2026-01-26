import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}) => {
  const { colors } = useTheme();

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: Spacing.lg };
      case 'large':
        return { paddingHorizontal: Spacing.xl };
      default:
        return { paddingHorizontal: Spacing.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 13;
      case 'large': return 15;
      default: return 14;
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.button,
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
      minHeight: 46,
      ...getPadding(),
    };

    switch (variant) {
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const color = (() => {
      switch (variant) {
        case 'secondary': return colors.text;
        case 'outline': return colors.primary;
        case 'ghost': return colors.primary;
        default: return '#FFFFFF';
      }
    })();

    return {
      fontSize: getFontSize(),
      fontWeight: Typography.button.fontWeight,
      fontFamily: Typography.button.fontFamily,
      color,
      marginLeft: loading ? Spacing.sm : icon ? Spacing.sm : 0,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {loading && <ActivityIndicator size="small" color={getTextStyle().color} />}
      {icon && !loading && icon}
      <Text style={getTextStyle()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};