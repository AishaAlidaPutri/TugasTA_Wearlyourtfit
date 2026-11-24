import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.btnSecondary;
      case 'outline':
        return styles.btnOutline;
      case 'ghost':
        return styles.btnGhost;
      case 'danger':
        return styles.btnDanger;
      case 'primary':
      default:
        return styles.btnPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'outline':
        return styles.textOutline;
      case 'ghost':
        return styles.textGhost;
      case 'danger':
        return styles.textDanger;
      case 'primary':
      default:
        return styles.textPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      case 'md':
      default:
        return styles.sizeMd;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        getContainerStyle(),
        getSizeStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {icon ? icon : null}
          <Text style={[styles.baseText, getTextStyle(), icon ? { marginLeft: 8 } : null, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
  },
  baseText: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  // Variants
  btnPrimary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.subtle,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  btnSecondary: {
    backgroundColor: COLORS.surfaceWarm,
  },
  textSecondary: {
    color: COLORS.textDark,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  textOutline: {
    color: COLORS.primaryDark,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  textGhost: {
    color: COLORS.textMedium,
  },
  btnDanger: {
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: '#F5C6C6',
  },
  textDanger: {
    color: COLORS.error,
  },
  // Sizes
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  disabled: {
    opacity: 0.55,
  },
});
