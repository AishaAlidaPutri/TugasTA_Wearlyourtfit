import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';

export default function Header({
  title,
  subtitle,
  onBack,
  rightAction,
  rightIcon,
  onRightPress,
}) {
  const insets = useSafeAreaInsets();
  const androidBar = StatusBar.currentHeight || 28;
  const topPadding = Platform.OS === 'android'
    ? androidBar + 22
    : Math.max(insets.top, 20) + SPACING.xs;

  return (
    <View style={[styles.header, { paddingTop: topPadding }]}>
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.right}>
        {rightAction ? (
          rightAction
        ) : rightIcon ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRightPress}
            style={styles.rightButton}
          >
            <Ionicons name={rightIcon} size={22} color={COLORS.textDark} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
