import React, { useCallback, useMemo, useState } from 'react';
import { Modal as RNModal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

export type DialogTone = 'info' | 'success' | 'warning' | 'error';

export type DialogAction = {
  label: string;
  onPress?: () => void;
};

export type DialogConfig = {
  visible: boolean;
  title: string;
  message: string;
  tone?: DialogTone;
  primary?: DialogAction;
  secondary?: DialogAction;
};

const toneIconMap: Record<DialogTone, { icon: keyof typeof Ionicons.glyphMap; colorKey: keyof ReturnType<typeof useTheme>['colors'] }> = {
  info: { icon: 'information-circle', colorKey: 'primary' },
  success: { icon: 'checkmark-circle', colorKey: 'success' },
  warning: { icon: 'alert-circle', colorKey: 'warning' },
  error: { icon: 'close-circle', colorKey: 'error' },
};

const AppDialog: React.FC<DialogConfig & { onClose: () => void }> = ({
  visible,
  title,
  message,
  tone = 'info',
  primary,
  secondary,
  onClose,
}) => {
  const { colors } = useTheme();
  const toneConfig = toneIconMap[tone];
  const iconColor = colors[toneConfig.colorKey] || colors.primary;

  const handlePrimary = () => {
    onClose();
    primary?.onPress?.();
  };

  const handleSecondary = () => {
    onClose();
    secondary?.onPress?.();
  };

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
              <Ionicons name={toneConfig.icon} size={26} color={iconColor} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          </View>

          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View style={styles.actions}>
            {secondary && (
              <TouchableOpacity style={[styles.button, styles.ghostButton]} onPress={handleSecondary}>
                <Text style={[styles.ghostText, { color: colors.text }]}>{secondary.label}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: iconColor }]}
              onPress={handlePrimary}
            >
              <Text style={styles.primaryText}>{primary?.label || 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
};

export const useAppDialog = () => {
  const defaultConfig: DialogConfig = useMemo(
    () => ({ visible: false, title: '', message: '', tone: 'info' }),
    []
  );
  const [config, setConfig] = useState<DialogConfig>(defaultConfig);

  const hideDialog = useCallback(() => {
    setConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const showDialog = useCallback(
    (
      title: string,
      message: string,
      options?: {
        tone?: DialogTone;
        primary?: DialogAction;
        secondary?: DialogAction;
      }
    ) => {
      setConfig({
        visible: true,
        title,
        message,
        tone: options?.tone || 'info',
        primary: options?.primary || { label: 'OK' },
        secondary: options?.secondary,
      });
    },
    []
  );

  const DialogComponent = useCallback(() => (
    <AppDialog {...config} onClose={hideDialog} />
  ), [config, hideDialog]);

  return { showDialog, hideDialog, Dialog: DialogComponent };
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    width: '92%',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  ghostText: {
    textAlign: 'center',
    fontWeight: '700',
  },
  primaryText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
  },
});

export default useAppDialog;
