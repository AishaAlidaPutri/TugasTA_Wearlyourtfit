import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { storage } from '../../services/storage';
import Header from '../../components/Header';

const DEFAULT_PROFILE = {
  name: '',
  nim: '',
  kelompok: '',
};

const appInformation = {
  name: 'wearlyourfit',
  tagline: 'Your Minimalist Digital Wardrobe & Outfit Planner',
  version: '1.0.0',
  description:
    'wearlyourfit adalah aplikasi digital wardrobe modern yang dirancang untuk membantu Anda mengelola koleksi busana, memadupadankan outfit secara visual, dan menjadwalkan penampilan terbaik untuk berbagai momen istimewa.',
  highlights: [
    {
      title: 'Digital Wardrobe Catalog',
      desc: 'Kelola pakaian dengan rapi berdasarkan 7 kategori fashion: Atasan, Bawahan, Outerwear, Dress, Sepatu, Tas, dan Aksesori.',
    },
    {
      title: 'Visual Outfit Planner',
      desc: 'Padukan berbagai item pakaian secara interaktif dan lihat pratinjau kombinasi sebelum disimpan.',
    },
    {
      title: 'Event & Date Scheduling',
      desc: 'Jadwalkan outfit harian sesuai tanggal dan agenda kegiatan seperti kuliah, rapat, pesta, atau liburan.',
    },
    {
      title: 'Supabase Cloud Backend',
      desc: 'Terhubung langsung dengan cloud database Supabase PostgreSQL & RESTful API Express.js.',
    },
  ],
  stack: [
    { name: 'React Native & Expo', role: 'Mobile Framework' },
    { name: 'Express.js', role: 'RESTful API Server' },
    { name: 'Supabase', role: 'PostgreSQL Database & Storage' },
    { name: 'Cloudinary', role: 'Image Asset CDN' },
  ],
};

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_PROFILE);

  useEffect(() => {
    async function loadProfile() {
      const saved = await storage.getUser();
      if (saved) {
        setProfile({
          name: saved.name || '',
          nim: saved.nim || '',
          kelompok: saved.kelompok || '',
        });
      }
    }
    loadProfile();
  }, []);

  const handleOpenEdit = () => {
    setFormData(profile);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    const updated = {
      ...profile,
      name: (formData.name || '').trim(),
      nim: (formData.nim || '').trim(),
      kelompok: (formData.kelompok || '').trim(),
    };
    setProfile(updated);
    await storage.saveUser(updated);
    setIsEditModalOpen(false);
  };

  const handleResetProfile = () => {
    Alert.alert(
      'Kosongkan Profil',
      'Apakah Anda yakin ingin mengosongkan data profil (Nama, NIM, Kelompok)?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kosongkan',
          style: 'destructive',
          onPress: async () => {
            const empty = { name: '', nim: '', kelompok: '' };
            setProfile(empty);
            setFormData(empty);
            await storage.saveUser(empty);
            setIsEditModalOpen(false);
          },
        },
      ]
    );
  };

  const isProfileEmpty = !profile.name && !profile.nim && !profile.kelompok;

  return (
    <View style={styles.container}>
      <Header title="Profil Saya" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Profile Section */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={40} color={COLORS.textDark} />
          </View>

          <View style={styles.profileIdentity}>
            <View style={styles.badgeRow}>
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>✦ Profil Pengguna</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOpenEdit}
                style={styles.editBtn}
              >
                <Ionicons name="create-outline" size={14} color={COLORS.primary} />
                <Text style={styles.editBtnText}>Edit Profil</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>
              {profile.name ? profile.name : 'Nama Belum Diisi'}
            </Text>

            <View style={styles.metaChipsRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>
                  <Text style={styles.metaBold}>NIM: </Text>
                  {profile.nim ? profile.nim : '-'}
                </Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>
                  <Text style={styles.metaBold}>Kelompok: </Text>
                  {profile.kelompok ? profile.kelompok : '-'}
                </Text>
              </View>
            </View>

            {isProfileEmpty && (
              <Text style={styles.emptyHintText}>
                Data profil masih kosong. Klik tombol{' '}
                <Text style={{ fontWeight: '700' }}>Edit Profil</Text> di atas untuk mengisi identitas Anda.
              </Text>
            )}
          </View>
        </View>

        {/* App Information Section */}
        <View style={styles.appSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWrap}>
              <Ionicons name="sparkles" size={18} color={COLORS.accentGold} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Tentang Aplikasi {appInformation.name}</Text>
            </View>
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>v{appInformation.version}</Text>
            </View>
          </View>

          <View style={styles.appDescCard}>
            <Text style={styles.appTagline}>"{appInformation.tagline}"</Text>
            <Text style={styles.appFullDesc}>{appInformation.description}</Text>
          </View>

          {/* Feature Highlights Grid */}
          <Text style={styles.subHeading}>Fitur Unggulan</Text>
          <View style={styles.featuresList}>
            {appInformation.highlights.map((item, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureHeaderRow}>
                  <View style={styles.featureNumberBox}>
                    <Text style={styles.featureNumber}>0{index + 1}</Text>
                  </View>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                </View>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>

          {/* Technology Stack */}
          <Text style={styles.subHeading}>Teknologi & Arsitektur</Text>
          <View style={styles.stackGrid}>
            {appInformation.stack.map((item, index) => (
              <View key={index} style={styles.stackCard}>
                <Text style={styles.stackName}>{item.name}</Text>
                <Text style={styles.stackRole}>{item.role}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal Edit Profil */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Ionicons name="person-outline" size={24} color={COLORS.textDark} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.modalTitle}>Edit Profil Pengguna</Text>
                <Text style={styles.modalSubtitle}>
                  Perbarui identitas Nama, NIM, dan Kelompok Anda di sini.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan nama lengkap Anda..."
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={formData.name}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, name: val }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>NIM</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan NIM Anda..."
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={formData.nim}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, nim: val }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Kelompok</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: Kelompok 01"
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={formData.kelompok}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, kelompok: val }))}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleResetProfile}
                  style={styles.btnReset}
                >
                  <Ionicons name="refresh-outline" size={16} color={COLORS.accentTerracotta} />
                  <Text style={styles.btnResetText}>Kosongkan</Text>
                </TouchableOpacity>

                <View style={styles.modalActionsRight}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsEditModalOpen(false)}
                    style={styles.btnCancel}
                  >
                    <Text style={styles.btnCancelText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSaveProfile}
                    style={styles.btnSave}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.btnSaveText}>Simpan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  profileHeaderCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    marginBottom: SPACING.lg,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.borderMedium,
  },
  profileIdentity: {
    width: '100%',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: COLORS.accentGoldLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGold,
    letterSpacing: 0.2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderMedium,
    backgroundColor: COLORS.surfaceWarm,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  metaChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metaChip: {
    backgroundColor: COLORS.surfaceWarm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaChipText: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  metaBold: {
    fontWeight: '700',
    color: COLORS.textDark,
  },
  emptyHintText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  appSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
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
  versionPill: {
    backgroundColor: COLORS.surfaceWarm,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  appDescCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
    marginBottom: SPACING.md,
  },
  appTagline: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accentGold,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  appFullDesc: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
    letterSpacing: -0.2,
  },
  featuresList: {
    gap: 10,
    marginBottom: SPACING.md,
  },
  featureCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  featureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureNumberBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  featureNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGold,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  featureDesc: {
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 18,
    marginLeft: 32,
  },
  stackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stackCard: {
    width: '48%',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  stackName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  stackRole: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.backgroundCard,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  modalForm: {
    paddingTop: SPACING.sm,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.textDark,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  modalActionsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  btnReset: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.accentTerracotta,
  },
  btnResetText: {
    fontSize: 12,
    color: COLORS.accentTerracotta,
    fontWeight: '600',
    marginLeft: 4,
  },
  btnCancel: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceWarm,
  },
  btnCancelText: {
    fontSize: 13,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  btnSave: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
  },
  btnSaveText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
