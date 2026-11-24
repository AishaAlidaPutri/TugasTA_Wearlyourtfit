import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';
import Header from '../../components/Header';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function OutfitDetailScreen({ route, navigation }) {
  const { outfitId } = route.params;
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchOutfitDetail();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOutfitDetail();
    });
    return unsubscribe;
  }, [outfitId, navigation]);

  const fetchOutfitDetail = async () => {
    try {
      const res = await api.getOutfitById(outfitId);
      if (res.success && res.data) {
        setOutfit(res.data);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Gagal memuat detail outfit.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Outfit',
      'Apakah Anda yakin ingin menghapus kombinasi outfit ini? (Pakaian individual di wardrobe tetap tersimpan).',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const res = await api.deleteOutfit(outfitId);
              if (res.success) {
                Alert.alert('Sukses', 'Outfit berhasil dihapus.');
                navigation.goBack();
              }
            } catch (err) {
              Alert.alert('Gagal Menghapus', err.message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Detail Outfit" onBack={() => navigation.goBack()} />
        <LoadingSpinner message="Memuat detail outfit..." fullScreen />
      </View>
    );
  }

  if (!outfit) return null;

  const items = outfit.items || [];

  return (
    <View style={styles.container}>
      <Header
        title={outfit.name}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Info Banner */}
        <View style={styles.headerCard}>
          <View style={styles.occasionBadge}>
            <Text style={styles.occasionBadgeText}>{outfit.occasion}</Text>
          </View>
          <Text style={styles.outfitTitle}>{outfit.name}</Text>
          {outfit.description ? (
            <Text style={styles.outfitDesc}>{outfit.description}</Text>
          ) : null}
          <View style={styles.countBadge}>
            <Ionicons name="shirt-outline" size={14} color={COLORS.primaryDark} />
            <Text style={styles.countBadgeText}>{items.length} Komponen Pakaian</Text>
          </View>
        </View>

        {/* Clothing Items in Outfit */}
        <Text style={styles.sectionHeading}>Pakaian yang Digunakan</Text>

        <View style={styles.itemsGrid}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('WardrobeDetail', { itemId: item.id })}
              style={styles.itemCard}
            >
              <Image source={{ uri: item.image_url }} style={styles.itemThumb} resizeMode="cover" />
              <View style={styles.itemInfo}>
                <View style={styles.catPill}>
                  <Text style={styles.catPillText}>{item.category}</Text>
                </View>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemColor}>{item.color || '-'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsBox}>
          <CustomButton
            title="Jadwalkan di Planner"
            variant="primary"
            icon={<Ionicons name="calendar-outline" size={18} color="#FFFFFF" />}
            onPress={() => navigation.navigate('ScheduleOutfit', { preSelectedOutfit: outfit })}
            style={styles.actionBtn}
          />

          <CustomButton
            title="Hapus Outfit"
            variant="danger"
            icon={<Ionicons name="trash-outline" size={18} color={COLORS.error} />}
            loading={deleting}
            onPress={handleDelete}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  headerCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
    marginBottom: SPACING.lg,
  },
  occasionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginBottom: 8,
  },
  occasionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  outfitTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  outfitDesc: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 19,
    marginBottom: 10,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceWarm,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: 6,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  itemCard: {
    width: '48%',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 12,
    ...SHADOWS.subtle,
  },
  itemThumb: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.surfaceWarm,
  },
  itemInfo: {
    padding: SPACING.sm,
  },
  catPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceWarm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    marginBottom: 4,
  },
  catPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textDark,
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  itemColor: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  actionsBox: {
    marginTop: SPACING.sm,
  },
  actionBtn: {
    marginBottom: 10,
  },
});
