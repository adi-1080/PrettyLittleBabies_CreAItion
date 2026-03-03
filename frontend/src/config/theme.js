// Eva Design System — Centralized Theme
// Inspired by modern, spacious, pastel-accent design language

export const COLORS = {
  // Core
  white: '#FFFFFF',
  black: '#000000',
  secondary: '#666666',
  background: '#FFFFFF',

  // Accent palette
  pink1: '#FCBDC8',
  pink2: '#FFEAAE',
  yellow1: '#FEFFB9',
  yellow2: '#FFFFE7',

  // Semantic
  meTime: '#E2F3E4',
  conflict: '#FFEDED',
  success: '#4CAF50',
  danger: '#FF5252',

  // UI
  border: '#F0F0F0',
  inputBg: '#F8F8F8',
  tabBarBg: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.04)',
};

export const FONTS = {
  heading: 'Quicksand_700Bold',
  headingMedium: 'Quicksand_600SemiBold',
  headingLight: 'Quicksand_500Medium',
  body: 'Fustat_400Regular',
  bodyMedium: 'Fustat_500Medium',
  bodySemiBold: 'Fustat_600SemiBold',
  bodyBold: 'Fustat_700Bold',
};

export const SIZES = {
  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  hero: 32,

  // Spacing
  paddingXS: 6,
  paddingSM: 10,
  paddingMD: 14,
  padding: 20,
  paddingLG: 24,
  paddingXL: 32,

  // Radius
  radiusSM: 12,
  radius: 16,
  radiusLG: 24,
  radiusXL: 28,
  radiusPill: 50,

  // Card
  cardPadding: 20,
  cardGap: 14,
  screenPadding: 22,
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

const theme = { COLORS, FONTS, SIZES, SHADOWS };
export default theme;
