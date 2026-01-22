import React from 'react';
import { Modal as RNModal, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
  fullScreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  animationType = 'slide',
  transparent = true,
  fullScreen = false,
}) => {
  const { colors } = useTheme();

  const overlayStyle: ViewStyle = {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: fullScreen ? 'flex-start' : 'center',
    alignItems: 'center',
    padding: fullScreen ? 0 : Spacing.md,
  };

  const contentStyle: ViewStyle = {
    backgroundColor: colors.background,
    borderRadius: fullScreen ? 0 : BorderRadius.lg,
    padding: fullScreen ? 0 : Spacing.lg,
    width: fullScreen ? '100%' : '90%',
    maxHeight: fullScreen ? '100%' : '80%',
    ...(fullScreen ? { flex: 1 } : {}),
  };

  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
      onRequestClose={onClose}
      statusBarTranslucent={fullScreen}
    >
      <TouchableOpacity
        style={overlayStyle}
        activeOpacity={1}
        onPress={fullScreen ? undefined : onClose}
      >
        <TouchableOpacity
          style={contentStyle}
          activeOpacity={1}
          onPress={() => {}} // Prevent closing when tapping content
        >
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};