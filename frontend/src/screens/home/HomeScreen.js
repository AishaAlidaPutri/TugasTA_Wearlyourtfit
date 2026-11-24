import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';
import { getGreeting, formatDateIndonesian } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const androidBar = StatusBar.currentHeight || 28;
  const topPadding = Platform.OS === 'android'
    ? androidBar + 26
    : Math.max(insets.top, 20) + SPACING.sm;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    counts: { wardrobe: 0, outfits: 0 },
    today_outfit: null,
    upcoming_outfit: null,
  });

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.getHomeSummary();
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.warn('Error fetching home summary:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSummary();
    });
    return unsubscribe;
  }, [navigation, fetchSummary]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  const greeting = getGreeting();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accentGold} />
        }
      >
        {/* Hero / Greeting Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>✦ Minimalist Wardrobe</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{greeting}, Fashion Enthusiast!</Text>
          <Text style={styles.heroSubtitle}>
            Kelola pakaian favoritmu, rancang padu-padan terbaik, dan tampil percaya diri setiap hari.
          </Text>

          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('OutfitStudio')}
              style={styles.heroBtnPrimary}
            >
              <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.heroBtnPrimaryText}>Rancang Outfit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Wardrobe')}
              style={styles.heroBtnSecondary}
            >
              <Ionicons name="shirt-outline" size={16} color={COLORS.textDark} style={{ marginRight: 6 }} />
              <Text style={styles.heroBtnSecondaryText}>Buka Wardrobe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Overview Stat Cards */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Wardrobe')}
            style={styles.statCard}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#F8F3EC' }]}>
              <Ionicons name="shirt-outline" size={22} color={COLORS.accentGold} />
            </View>
            <View style={styles.statDetails}>
              <Text style={styles.statLabel}>Total Koleksi Pakaian</Text>
              <Text style={styles.statValue}>{summary.counts.wardrobe}</Text>
              <Text style={styles.statHint}>Lihat semua pakaian →</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Planner')}
            style={styles.statCard}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#F4EFE9' }]}>
              <Ionicons name="sparkles-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.statDetails}>
              <Text style={styles.statLabel}>Kombinasi Outfit</Text>
              <Text style={styles.statValue}>{summary.counts.outfits}</Text>
              <Text style={styles.statHint}>Lihat outfit planner →</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && <LoadingSpinner message="Menghubungkan ke koleksi wearlyourfit..." />}

        {/* Content Section: Jadwal Hari Ini / Terdekat */}
        {!loading && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.accentGold} style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Jadwal Outfit Terdekat</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Planner')}>
                <Text style={styles.seeAllText}>Buka Kalender</Text>
              </TouchableOpacity>
            </View>

            {summary.today_outfit || summary.upcoming_outfit ? (
              <View style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.scheduleBadge}>
                    <Text style={styles.scheduleBadgeText}>
                      {summary.today_outfit ? 'HARI INI' : 'MENDATANG'}
                    </Text>
                  </View>
                  <Text style={styles.scheduleDate}>
                    {formatDateIndonesian(
                      (summary.today_outfit || summary.upcoming_outfit)?.schedule_date
                    )}
                  </Text>
                </View>

                <Text style={styles.eventName}>
                  {(summary.today_outfit || summary.upcoming_outfit)?.event_name}
                </Text>

                <View style={styles.outfitMetaRow}>
                  <Text style={styles.outfitName}>
                    {(summary.today_outfit || summary.upcoming_outfit)?.outfit_name}
                  </Text>
                  <View style={styles.occasionPill}>
                    <Text style={styles.occasionText}>
                      {(summary.today_outfit || summary.upcoming_outfit)?.outfit_occasion || 'Casual'}
                    </Text>
                  </View>
                </View>

                {/* Thumbnails of outfit items */}
                {(summary.today_outfit || summary.upcoming_outfit)?.items?.length > 0 && (
                  <View style={styles.thumbsRow}>
                    {(summary.today_outfit || summary.upcoming_outfit).items.slice(0, 4).map((it, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: it.image_url }}
                        style={styles.itemThumb}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="calendar-outline" size={28} color={COLORS.textLight} />
                </View>
                <Text style={styles.emptyTitle}>Belum Ada Jadwal Terdekat</Text>
                <Text style={styles.emptyDesc}>
                  Rencanakan penampilan terbaikmu untuk kuliah, pesta, atau acara penting lainnya.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Planner')}
                  style={styles.emptyActionBtn}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.emptyActionBtnText}>Buat Jadwal Baru</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
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
  heroCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    marginBottom: SPACING.md,
  },
  heroBadgeRow: {
    marginBottom: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentGoldLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGold,
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceWarm,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderMedium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statDetails: {},
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  statHint: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accentGold,
  },
  sectionWrap: {
    marginTop: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentGold,
  },
  scheduleCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleBadge: {
    backgroundColor: COLORS.accentGoldLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.pill,
  },
  scheduleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGold,
  },
  scheduleDate: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  outfitMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  outfitName: {
    fontSize: 13,
    color: COLORS.textMedium,
    marginRight: 8,
  },
  occasionPill: {
    backgroundColor: COLORS.surfaceWarm,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: RADIUS.pill,
  },
  occasionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  thumbsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  itemThumb: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceWarm,
  },
  emptyCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
    maxWidth: 260,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  emptyActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
