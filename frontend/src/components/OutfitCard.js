import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';

export default function OutfitCard({
  outfit,
  onPress,
  style,
}) {
  const items = outfit.items || [];
  const previewItems = items.slice(0, 4);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {/* Visual Collage Preview */}
      <View style={styles.collageContainer}>
        {items.length === 0 ? (
          <View style={styles.emptyPreview}>
            <Ionicons name="shirt-outline" size={32} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Tidak ada item</Text>
          </View>
        ) : items.length === 1 ? (
          <Image
            source={{ uri: items[0].image_url }}
            style={styles.fullImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.gridCollage}>
            {previewItems.map((item, idx) => (
              <View key={item.id || idx} style={styles.gridCell}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.cellImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        )}

        <View style={styles.occasionBadge}>
          <Text style={styles.occasionText}>{outfit.occasion || 'Casual'}</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{items.length} Pakaian</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{outfit.name}</Text>
        {outfit.description ? (
          <Text style={styles.description} numberOfLines={1}>{outfit.description}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.subtle,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  collageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.surfaceWarm,
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  gridCollage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  gridCell: {
    width: '50%',
    height: '50%',
    padding: 1.5,
  },
  cellImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  emptyPreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
  },
  occasionBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  occasionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(45, 34, 36, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  info: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
});
