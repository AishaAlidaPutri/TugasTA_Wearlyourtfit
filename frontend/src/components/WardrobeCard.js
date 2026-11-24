import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';

export default function WardrobeCard({
  item,
  onPress,
  selected = false,
  showSelect = false,
  style,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        selected && styles.cardSelected,
        style,
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        {showSelect ? (
          <View style={[styles.selectCircle, selected && styles.selectCircleActive]}>
            {selected ? <View style={styles.selectInnerDot} /> : null}
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <View style={styles.colorRow}>
          <View style={styles.colorDotContainer}>
            <View style={[styles.colorDot, { backgroundColor: item.color ? getColorHex(item.color) : COLORS.primary }]} />
          </View>
          <Text style={styles.colorText} numberOfLines={1}>{item.color || '-'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getColorHex(colorName = '') {
  const map = {
    white: '#FFFFFF',
    cream: '#FFF8DC',
    beige: '#E6D7C3',
    pink: '#F4C2C2',
    black: '#1C1917',
    blue: '#A7C7E7',
    navy: '#1B263B',
    green: '#B2AC88',
    brown: '#5E4B43',
    red: '#D96E6E',
    grey: '#B0A8A6',
    gray: '#B0A8A6',
  };
  return map[colorName.toLowerCase()] || COLORS.primary;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.subtle,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primaryLight,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.surfaceWarm,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: COLORS.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  selectInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDotContainer: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  colorText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});
