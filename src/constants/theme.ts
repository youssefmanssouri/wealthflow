export const PALETTE = {
  // Brand Primary (Restrained, Editorial Emerald)
  emerald500: '#10B981',
  emerald600: '#059669',
  emerald700: '#047857',
  emerald900: '#064E3B',
  emeraldLight: 'rgba(5, 150, 105, 0.08)',

  // Semantics (Quiet, purposeful movement indicators)
  positive: '#059669',
  positiveBg: 'rgba(5, 150, 105, 0.08)',
  warning: '#D97706',
  warningBg: 'rgba(217, 119, 6, 0.08)',
  negative: '#DC2626',
  negativeBg: 'rgba(220, 38, 38, 0.08)',
  info: '#2563EB',
  infoBg: 'rgba(37, 99, 235, 0.08)',

  // Dark Palette (Matte Charcoal & Slate — Calm, Flat, Architectural)
  darkBackground: '#0A0D14',
  darkSurface: '#111622',
  darkCard: '#151B27',
  darkCardHover: '#1B2230',
  darkBorder: '#1F2633',
  darkTextPrimary: '#F8FAFC',
  darkTextSecondary: '#94A3B8',
  darkTextMuted: '#64748B',

  // Light Palette (Warm/Crisp Off-White — Editorial, Clean, High Contrast)
  lightBackground: '#F9FAFB',
  lightSurface: '#FFFFFF',
  lightCard: '#FFFFFF',
  lightCardHover: '#F3F4F6',
  lightBorder: '#E5E7EB',
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
    tabBarBorder: PALETTE.lightBorder,
    tabActive: PALETTE.emerald600,
    tabInactive: PALETTE.lightTextMuted,
    inputBg: '#F3F4F6',
    inputBorder: PALETTE.lightBorder,
    modalOverlay: 'rgba(15, 23, 42, 0.55)',
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
    primaryLight: 'rgba(16, 185, 129, 0.12)',
    positive: PALETTE.emerald500,
    positiveBg: 'rgba(16, 185, 129, 0.12)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.12)',
    negative: '#EF4444',
    negativeBg: 'rgba(239, 68, 68, 0.12)',
    info: '#3B82F6',
    infoBg: 'rgba(59, 130, 246, 0.12)',
    tabBar: PALETTE.darkSurface,
    tabBarBorder: PALETTE.darkBorder,
    tabActive: PALETTE.emerald500,
    tabInactive: PALETTE.darkTextMuted,
    inputBg: '#151B27',
    inputBorder: PALETTE.darkBorder,
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
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 16,
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
    giant: 34,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};
