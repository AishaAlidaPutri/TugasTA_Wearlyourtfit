import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';
import { formatDateIndonesian } from '../../utils/helpers';
import CalendarView from '../../components/CalendarView';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PlannerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const androidBar = StatusBar.currentHeight || 28;
  const topPadding = Platform.OS === 'android'
    ? androidBar + 22
    : Math.max(insets.top, 20) + SPACING.xs;

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await api.getSchedules();
      if (res.success && res.data) {
        setSchedules(res.data);
      }
    } catch (err) {
      console.warn('Error fetching schedules:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSchedules();
    });
    return unsubscribe;
  }, [navigation, fetchSchedules]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedules();
  };

  // Find unique scheduled dates for the calendar dots
  const scheduledDates = Array.from(
    new Set(schedules.map((s) => (s.schedule_date ? s.schedule_date.slice(0, 10) : '')))
  ).filter(Boolean);

  // Filter schedules for the selected date
  const schedulesOnSelectedDate = schedules.filter(
    (s) => s.schedule_date && s.schedule_date.slice(0, 10) === selectedDate
  );

  const handleDeleteSchedule = (id) => {
    Alert.alert(
      'Hapus Jadwal',
      'Apakah Anda yakin ingin menghapus jadwal rencana outfit ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.deleteSchedule(id);
              if (res.success) {
                fetchSchedules();
              }
            } catch (err) {
              Alert.alert('Gagal Menghapus', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle}>Outfit Planner</Text>
          <Text style={styles.screenSubtitle}>Rencanakan pakaianmu untuk setiap momen</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ScheduleOutfit', { selectedDate })}
          style={styles.addButton}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.addButtonText}>Jadwal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accentGold} />
        }
      >
        {/* Calendar View */}
        <CalendarView
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          scheduledDates={scheduledDates}
        />

        {/* Selected Date Header */}
        <View style={styles.dateHeaderRow}>
          <View>
            <Text style={styles.dateTitle}>{formatDateIndonesian(selectedDate)}</Text>
            <Text style={styles.dateSubtitle}>
              {schedulesOnSelectedDate.length} Rencana Outfit
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ScheduleOutfit', { selectedDate })}
            style={styles.addScheduleLink}
          >
            <Ionicons name="add-circle" size={16} color={COLORS.primary} />
            <Text style={styles.addScheduleLinkText}>Jadwalkan</Text>
          </TouchableOpacity>
        </View>

        {/* Scheduled Outfits List */}
        {loading ? (
          <LoadingSpinner message="Memuat jadwal..." />
        ) : schedulesOnSelectedDate.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Tidak Ada Jadwal"
            description={`Belum ada outfit yang direncanakan untuk ${formatDateIndonesian(selectedDate)}.`}
            actionTitle="+ Buat Jadwal Hari Ini"
            onAction={() => navigation.navigate('ScheduleOutfit', { selectedDate })}
          />
        ) : (
          schedulesOnSelectedDate.map((sched) => (
            <View key={sched.id} style={styles.scheduleCard}>
              <View style={styles.scheduleCardHeader}>
                <View style={styles.eventPill}>
                  <Text style={styles.eventPillText}>{sched.event_name}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteSchedule(sched.id)}
                  style={styles.trashBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('OutfitDetail', { outfitId: sched.outfit_id })}
                style={styles.outfitRow}
              >
                <View style={styles.outfitTextCol}>
                  <Text style={styles.outfitTitle}>{sched.outfit_name}</Text>
                  <Text style={styles.outfitOccasion}>Occasion: {sched.outfit_occasion || 'Casual'}</Text>
                  {sched.notes ? (
                    <Text style={styles.scheduleNotes} numberOfLines={2}>
                      "{sched.notes}"
                    </Text>
                  ) : null}
                </View>

                {sched.items && sched.items.length > 0 ? (
                  <View style={styles.thumbStack}>
                    {sched.items.slice(0, 3).map((item, idx) => (
                      <Image
                        key={item.id || idx}
                        source={{ uri: item.image_url }}
                        style={[styles.stackThumb, { marginLeft: idx > 0 ? -16 : 0 }]}
                      />
                    ))}
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                )}
              </TouchableOpacity>
            </View>
          ))
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  dateSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  addScheduleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceWarm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  addScheduleLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginLeft: 4,
  },
  scheduleCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
    marginBottom: SPACING.md,
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventPill: {
    backgroundColor: COLORS.accentGoldLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  eventPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGold,
  },
  trashBtn: {
    padding: 4,
  },
  outfitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  outfitTextCol: {
    flex: 1,
    marginRight: 10,
  },
  outfitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  outfitOccasion: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  scheduleNotes: {
    fontSize: 11,
    color: COLORS.textMedium,
    fontStyle: 'italic',
    marginTop: 4,
  },
  thumbStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceWarm,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
