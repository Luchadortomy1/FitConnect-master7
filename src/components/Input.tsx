import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  leftIcon,
  rightIcon,
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles: ViewStyle = {
    marginBottom: Spacing.md,
    ...containerStyle,
  };

  const labelStyle: TextStyle = {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
    lineHeight: 18,
    color: colors.text,
    marginBottom: Spacing.xs,
  };

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderColor: getBorderColor(),
    minHeight: 44,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter',
    lineHeight: 19,
    paddingVertical: 10,
    color: colors.text,
    marginLeft: leftIcon ? Spacing.sm : 0,
    marginRight: rightIcon ? Spacing.sm : 0,
  };

  const helperStyle: TextStyle = {
    fontSize: 11,
    fontFamily: 'Inter',
    marginTop: Spacing.xs,
    color: error ? colors.error : colors.textSecondary,
  };

  return (
    <View style={containerStyles}>
      {label && <Text style={labelStyle}>{label}</Text>}
      <View style={inputContainerStyle}>
        {leftIcon && <View>{leftIcon}</View>}
        <TextInput
          style={inputStyle}
          placeholderTextColor={colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessible={true}
          accessibilityLabel={label}
          {...textInputProps}
        />
        {rightIcon && <View>{rightIcon}</View>}
      </View>
      {(error || helperText) && (
        <Text style={helperStyle}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};