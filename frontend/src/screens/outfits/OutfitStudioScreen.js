import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { CATEGORIES, OCCASIONS } from '../../utils/helpers';
import { api } from '../../services/api';
import Header from '../../components/Header';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function OutfitStudioScreen({ navigation }) {
  const [wardrobe, setWardrobe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Atasan');
  const [selectedItems, setSelectedItems] = useState([]); // Array of wardrobe items
  const [modalVisible, setModalVisible] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [occasion, setOccasion] = useState('Casual');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchWardrobe();
  }, []);

  const fetchWardrobe = async () => {
    try {
      const res = await api.getWardrobeItems();
      if (res.success && res.data) {
        setWardrobe(res.data);
      }
    } catch (err) {
      console.warn('Error fetching wardrobe for studio:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectItem = (item) => {
    const exists = selectedItems.some((i) => i.id === item.id);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const handleOpenSaveModal = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Pilih Pakaian', 'Pilih minimal satu pakaian untuk membuat outfit.');
      return;
    }
    setOutfitName('');
    setDescription('');
    setSaveError('');
    setModalVisible(true);
  };

  const handleSaveOutfit = async () => {
    if (!outfitName.trim()) {
      setSaveError('Nama outfit wajib diisi.');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      const payload = {
        name: outfitName.trim(),
        occasion,
        description: description.trim(),
        item_ids: selectedItems.map((i) => i.id),
      };

      const res = await api.createOutfit(payload);
      if (res.success) {
        setModalVisible(false);
        setSelectedItems([]);
        Alert.alert('Sukses', 'Kombinasi outfit berhasil disimpan!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (err) {
      setSaveError(err.message || 'Gagal menyimpan outfit.');
    } finally {
      setSaving(false);
    }
  };

  const filteredWardrobe = wardrobe.filter(
    (w) => selectedCategory === 'All' || w.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const availableCategories = CATEGORIES.filter((c) => c !== 'All');
  const availableOccasions = OCCASIONS.filter((o) => o !== 'All');

  return (
    <View style={styles.container}>
      <Header
        title="Mix & Match Studio"
        subtitle="Rancang kombinasi pakaian impianmu"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenSaveModal}
            style={[styles.saveTopBtn, selectedItems.length === 0 && styles.saveTopBtnDisabled]}
          >
            <Text style={styles.saveTopBtnText}>Simpan</Text>
          </TouchableOpacity>
        }
      />

      {/* Top Preview Canvas (Selected Items) */}
      <View style={styles.previewCanvas}>
        <View style={styles.canvasHeader}>
          <Text style={styles.canvasTitle}>Kombinasi Terpilih ({selectedItems.length})</Text>
          {selectedItems.length > 0 ? (
            <TouchableOpacity onPress={() => setSelectedItems([])}>
              <Text style={styles.clearText}>Reset</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {selectedItems.length === 0 ? (
          <View style={styles.emptyCanvas}>
            <Ionicons name="sparkles-outline" size={28} color={COLORS.primary} />
            <Text style={styles.emptyCanvasText}>Ketuk pakaian di bawah untuk menggabungkan</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.canvasList}>
            {selectedItems.map((item) => (
              <View key={item.id} style={styles.canvasThumbWrapper}>
                <Image source={{ uri: item.image_url }} style={styles.canvasThumb} resizeMode="cover" />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => removeItem(item.id)}
                  style={styles.removeBadge}
                >
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.canvasThumbCat} numberOfLines={1}>{item.category}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={availableCategories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryTabsList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(item)}
                style={[styles.catTab, isSelected && styles.catTabActive]}
              >
                <Text style={[styles.catTabText, isSelected && styles.catTabTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Wardrobe Items to Pick From */}
      {loading ? (
        <LoadingSpinner message="Memuat pakaian..." />
      ) : (
        <FlatList
          data={filteredWardrobe}
          keyExtractor={(item) => String(item.id)}
          numColumns={3}
          contentContainerStyle={styles.gridList}
          renderItem={({ item }) => {
            const isSelected = selectedItems.some((i) => i.id === item.id);
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleSelectItem(item)}
                style={[styles.pickItemCard, isSelected && styles.pickItemCardSelected]}
              >
                <Image source={{ uri: item.image_url }} style={styles.pickItemImage} resizeMode="cover" />
                {isSelected ? (
                  <View style={styles.selectedOverlay}>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  </View>
                ) : null}
                <Text style={styles.pickItemName} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyGrid}>
              <Ionicons name="shirt-outline" size={32} color={COLORS.textLight} />
              <Text style={styles.emptyGridText}>Belum ada pakaian di kategori {selectedCategory}.</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddWardrobe')}
                style={styles.addDirectBtn}
              >
                <Text style={styles.addDirectText}>+ Tambah {selectedCategory}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Save Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Simpan Kombinasi Outfit</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {saveError ? (
              <View style={styles.modalErrorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                <Text style={styles.modalErrorText}>{saveError}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Nama Outfit"
              placeholder="Contoh: Soft Office Pastel"
              value={outfitName}
              onChangeText={setOutfitName}
            />

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Occasion / Kegiatan</Text>
              <View style={styles.occasionChipsRow}>
                {availableOccasions.map((occ) => {
                  const isSelected = occasion === occ;
                  return (
                    <TouchableOpacity
                      key={occ}
                      activeOpacity={0.7}
                      onPress={() => setOccasion(occ)}
                      style={[styles.occasionChip, isSelected && styles.occasionChipActive]}
                    >
                      <Text style={[styles.occasionChipText, isSelected && styles.occasionChipTextActive]}>
                        {occ}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <CustomInput
              label="Deskripsi / Catatan (Opsional)"
              placeholder="Catatan aksesoris pelengkap atau rekomendasi cuaca"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            <CustomButton
              title="Simpan Outfit Sekarang"
              onPress={handleSaveOutfit}
              loading={saving}
              style={{ marginTop: SPACING.sm }}
            />
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
  saveTopBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
  },
  saveTopBtnDisabled: {
    opacity: 0.5,
  },
  saveTopBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  previewCanvas: {
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.subtle,
  },
  canvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  canvasTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  clearText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  emptyCanvas: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS.md,
  },
  emptyCanvasText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
  },
  canvasList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  canvasThumbWrapper: {
    width: 72,
    marginRight: 10,
    position: 'relative',
    alignItems: 'center',
  },
  canvasThumb: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceWarm,
  },
  removeBadge: {
    position: 'absolute',
    top: -4,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasThumbCat: {
    fontSize: 10,
    color: COLORS.textMedium,
    marginTop: 3,
    fontWeight: '600',
  },
  categoryTabs: {
    marginBottom: SPACING.sm,
  },
  categoryTabsList: {
    paddingHorizontal: SPACING.md,
  },
  catTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceWarm,
    marginRight: 8,
  },
  catTabActive: {
    backgroundColor: COLORS.primary,
  },
  catTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  catTabTextActive: {
    color: '#FFFFFF',
  },
  gridList: {
    padding: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  pickItemCard: {
    flex: 1 / 3,
    margin: 4,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 4,
    alignItems: 'center',
  },
  pickItemCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primaryLight,
  },
  pickItemImage: {
    width: '100%',
    height: 90,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceWarm,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  pickItemName: {
    fontSize: 11,
    color: COLORS.textDark,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyGrid: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyGridText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
    marginBottom: 10,
    textAlign: 'center',
  },
  addDirectBtn: {
    backgroundColor: COLORS.surfaceWarm,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  addDirectText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    padding: 8,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  modalErrorText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 6,
    flex: 1,
  },
  formSection: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  occasionChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  occasionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceWarm,
    marginRight: 6,
    marginBottom: 6,
  },
  occasionChipActive: {
    backgroundColor: COLORS.primary,
  },
  occasionChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  occasionChipTextActive: {
    color: '#FFFFFF',
  },
});
