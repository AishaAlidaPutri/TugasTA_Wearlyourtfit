import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';
import Header from '../../components/Header';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ScheduleOutfitScreen({ route, navigation }) {
  const { selectedDate, preSelectedOutfit } = route.params || {};
  const [date, setDate] = useState(selectedDate || new Date().toISOString().slice(0, 10));
  const [eventName, setEventName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedOutfit, setSelectedOutfit] = useState(preSelectedOutfit || null);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      const res = await api.getOutfits();
      if (res.success && res.data) {
        setOutfits(res.data);
        if (!selectedOutfit && res.data.length > 0) {
          setSelectedOutfit(res.data[0]);
        }
      }
    } catch (err) {
      console.warn('Error fetching outfits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!date.trim()) {
      setError('Tanggal jadwal wajib diisi.');
      return;
    }
    if (!eventName.trim()) {
      setError('Nama acara atau kegiatan wajib diisi.');
      return;
    }
    if (!selectedOutfit) {
      setError('Silakan pilih salah satu outfit untuk jadwal ini.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        outfit_id: selectedOutfit.id,
        event_name: eventName.trim(),
        schedule_date: date.trim(),
        notes: notes.trim(),
      };

      const res = await api.createSchedule(payload);
      if (res.success) {
        Alert.alert('Sukses', 'Jadwal outfit berhasil ditambahkan!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      setError(err.message || 'Gagal menyimpan jadwal outfit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Jadwalkan Outfit"
        subtitle="Rencanakan pakaianmu untuk acara tertentu"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        ) : null}

        {/* Date Input */}
        <CustomInput
          label="Tanggal (YYYY-MM-DD)"
          placeholder="2026-11-23"
          value={date}
          onChangeText={setDate}
          icon={<Ionicons name="calendar-outline" size={18} color={COLORS.textLight} />}
        />

        {/* Event Name Input */}
        <CustomInput
          label="Nama Acara / Kegiatan"
          placeholder="Contoh: Kuliah Pagi, Meeting Proyek, Dinner Date"
          value={eventName}
          onChangeText={setEventName}
          icon={<Ionicons name="ribbon-outline" size={18} color={COLORS.textLight} />}
        />

        {/* Select Outfit */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Pilih Kombinasi Outfit</Text>

          {loading ? (
            <LoadingSpinner message="Memuat koleksi outfit..." />
          ) : outfits.length === 0 ? (
            <View style={styles.noOutfitsBox}>
              <Text style={styles.noOutfitsText}>Belum ada outfit tersimpan.</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('OutfitStudio')}
                style={styles.makeOutfitBtn}
              >
                <Text style={styles.makeOutfitText}>+ Buat Outfit Terlebih Dahulu</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outfitsRow}>
              {outfits.map((outfit) => {
                const isSelected = selectedOutfit && selectedOutfit.id === outfit.id;
                const previewImg = outfit.items && outfit.items[0] ? outfit.items[0].image_url : null;

                return (
                  <TouchableOpacity
                    key={outfit.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedOutfit(outfit)}
                    style={[styles.outfitPickCard, isSelected && styles.outfitPickCardSelected]}
                  >
                    <View style={styles.outfitThumbContainer}>
                      {previewImg ? (
                        <Image source={{ uri: previewImg }} style={styles.outfitThumb} resizeMode="cover" />
                      ) : (
                        <View style={styles.emptyThumb}>
                          <Ionicons name="shirt-outline" size={24} color={COLORS.textLight} />
                        </View>
                      )}
                      {isSelected ? (
                        <View style={styles.selectedCircle}>
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.outfitPickName} numberOfLines={1}>{outfit.name}</Text>
                    <Text style={styles.outfitPickOccasion}>{outfit.occasion}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Optional Notes */}
        <CustomInput
          label="Catatan Acara (Opsional)"
          placeholder="Contoh: Siapkan payung dan tas laptop"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        {/* Save Button */}
        <CustomButton
          title={submitting ? 'Menyimpan Jadwal...' : 'Simpan Rencana Outfit'}
          onPress={handleSaveSchedule}
          loading={submitting}
          style={styles.saveBtn}
        />
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    padding: 10,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  errorBoxText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 8,
    flex: 1,
  },
  formSection: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  noOutfitsBox: {
    backgroundColor: COLORS.surfaceWarm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  noOutfitsText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  makeOutfitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
  },
  makeOutfitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outfitsRow: {
    paddingVertical: 4,
  },
  outfitPickCard: {
    width: 110,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: 6,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    marginRight: 10,
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  outfitPickCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  outfitThumbContainer: {
    width: '100%',
    height: 100,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.surfaceWarm,
  },
  outfitThumb: {
    width: '100%',
    height: '100%',
  },
  emptyThumb: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitPickName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 6,
    textAlign: 'center',
  },
  outfitPickOccasion: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 1,
  },
  saveBtn: {
    marginTop: SPACING.md,
  },
});
