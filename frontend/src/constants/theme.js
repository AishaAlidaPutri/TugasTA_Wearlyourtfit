export const COLORS = {
  // Backgrounds - Fashion Neutral Canvas
  background: '#FAF8F5',       // Warm canvas / ivory
  backgroundCard: '#FFFFFF',   // Crisp clean surface
  surfaceWarm: '#F4EFE9',      // Muted background
  surfaceSubtle: '#FCFBF9',    // Subtle surface
  surfaceMuted: '#EDE6DD',     // Muted borders / chip background
  
  // Primary - Elegant Minimalist Dark & Warm Charcoal
  primary: '#1F1D1A',          // Dark luxury charcoal
  primaryDark: '#141210',      // Deep onyx
  primaryLight: '#F4EFE9',     // Soft canvas
  primaryHover: '#332F2A',

  // Earth & Luxury Accents
  accentGold: '#BFA074',       // Subtle luxury gold
  accentGoldLight: '#FBF7F0',  // Soft gold badge background
  accentTerracotta: '#C26D53', // Warm terracotta
  accentTaupe: '#8C8275',      // Neutral taupe
  
  // Typography - Warm Neutral Onyx & Stone
  textDark: '#1C1917',         // Primary text
  textMedium: '#6E675F',       // Secondary text
  textLight: '#9C9489',        // Muted captions & timestamps
  textPlaceholder: '#B5ADA4',
  textInverse: '#FFFFFF',
  
  // UI Elements
  border: '#ECE6DD',
  borderLight: '#F4EFE9',
  borderMedium: '#DED6C9',
  borderStrong: '#24201C',
  divider: '#ECE6DD',
  
  // Status Colors
  success: '#6B9080',
  successLight: '#EDF5F0',
  error: '#C26D53',
  errorLight: '#FDF2F0',
  warning: '#BFA074',
  warningLight: '#FDF9F3',
  
  // Shadows & Overlays
  overlay: 'rgba(28, 25, 23, 0.45)',
  shadow: 'rgba(35, 30, 25, 0.06)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 9999,
};

export const SHADOWS = {
  subtle: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  hover: {
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
};
