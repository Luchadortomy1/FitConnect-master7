export const Colors = {
  light: {
    primary: '#3B82F6',
    secondary: '#0EA5E9',
    background: '#F7F9FC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    border: '#E2E8F0',
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#0284C7',
  },
  dark: {
    primary: '#60A5FA',
    secondary: '#38BDF8',
    background: '#0B1220',
    surface: '#111827',
    text: '#E5E7EB',
    textSecondary: '#9CA3AF',
    border: '#1F2937',
    success: '#22C55E',
    warning: '#FCD34D',
    error: '#EF4444',
    info: '#38BDF8',
  },
};

export const Typography = {
  h1: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
    fontFamily: 'Inter',
  },
  h2: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    fontFamily: 'Inter',
  },
  h4: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  body1: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 19,
    fontFamily: 'Inter',
  },
  body2: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 18,
    fontFamily: 'Inter',
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 17,
    fontFamily: 'Inter',
  },
  button: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
    fontFamily: 'Inter',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  button: 14,
  round: 999,
};

export const Shadows = {
  light: {
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
};