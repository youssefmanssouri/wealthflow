export const PALETTE = {
  // Brand Primary
  emerald500: '#10B981',
  emerald600: '#059669',
  emerald700: '#047857',
  emerald900: '#064E3B',
  emeraldLight: '#D1FAE5',

  // Semantics
  positive: '#10B981',
  positiveBg: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  negative: '#EF4444',
  negativeBg: 'rgba(239, 68, 68, 0.12)',
  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.12)',

  // Dark Palette (Sophisticated Slate/Zinc)
  darkBackground: '#0B0F17',
  darkSurface: '#151C28',
  darkCard: '#1E2738',
  darkCardHover: '#26334A',
  darkBorder: '#2A364F',
  darkTextPrimary: '#F9FAFB',
  darkTextSecondary: '#9CA3AF',
  darkTextMuted: '#6B7280',

  // Light Palette (Clean, Calm Fintech Light)
  lightBackground: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightCard: '#FFFFFF',
  lightCardHover: '#F1F5F9',
  lightBorder: '#E2E8F0',
  lightTextPrimary: '#0F172A',
  lightTextSecondary: '#475569',
  lightTextMuted: '#94A3B8',
};

export const LIGHT_THEME = {
  mode: 'light' as const,
  colors: {
    background: PALETTE.lightBackground,
    surface: PALETTE.lightSurface,
    card: PALETTE.lightCard,
    cardHover: PALETTE.lightCardHover,
    border: PALETTE.lightBorder,
    textPrimary: PALETTE.lightTextPrimary,
    textSecondary: PALETTE.lightTextSecondary,
    textMuted: PALETTE.lightTextMuted,
    primary: PALETTE.emerald600,
    primaryLight: PALETTE.emeraldLight,
    positive: PALETTE.positive,
    positiveBg: PALETTE.positiveBg,
    warning: PALETTE.warning,
    warningBg: PALETTE.warningBg,
    negative: PALETTE.negative,
    negativeBg: PALETTE.negativeBg,
    info: PALETTE.info,
    infoBg: PALETTE.infoBg,
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    tabActive: PALETTE.emerald600,
    tabInactive: '#94A3B8',
    inputBg: '#F1F5F9',
    inputBorder: '#CBD5E1',
    modalOverlay: 'rgba(15, 23, 42, 0.5)',
  },
};

export const DARK_THEME = {
  mode: 'dark' as const,
  colors: {
    background: PALETTE.darkBackground,
    surface: PALETTE.darkSurface,
    card: PALETTE.darkCard,
    cardHover: PALETTE.darkCardHover,
    border: PALETTE.darkBorder,
    textPrimary: PALETTE.darkTextPrimary,
    textSecondary: PALETTE.darkTextSecondary,
    textMuted: PALETTE.darkTextMuted,
    primary: PALETTE.emerald500,
    primaryLight: 'rgba(16, 185, 129, 0.18)',
    positive: PALETTE.positive,
    positiveBg: PALETTE.positiveBg,
    warning: PALETTE.warning,
    warningBg: PALETTE.warningBg,
    negative: PALETTE.negative,
    negativeBg: PALETTE.negativeBg,
    info: PALETTE.info,
    infoBg: PALETTE.infoBg,
    tabBar: PALETTE.darkSurface,
    tabBarBorder: PALETTE.darkBorder,
    tabActive: PALETTE.emerald500,
    tabInactive: PALETTE.darkTextMuted,
    inputBg: '#1E2738',
    inputBorder: '#2A364F',
    modalOverlay: 'rgba(0, 0, 0, 0.75)',
  },
};

export type ThemeColors = typeof LIGHT_THEME.colors;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const TYPOGRAPHY = {
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    giant: 36,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};
