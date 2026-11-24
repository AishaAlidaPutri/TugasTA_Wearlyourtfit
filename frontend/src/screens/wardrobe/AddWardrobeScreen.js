import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { CATEGORIES } from '../../utils/helpers';
import { api } from '../../services/api';
import Header from '../../components/Header';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

export default function AddWardrobeScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Atasan');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Select image from device gallery using Expo Image Picker
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Izin Dibutuhkan', 'Aplikasi memerlukan izin untuk mengakses galeri foto Anda.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageFile(asset);
        setError('');
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      Alert.alert('Error', 'Gagal membuka galeri foto: ' + err.message);
    }
  };

  const handleSave = async () => {
    if (!imageUri) {
      setError('Silakan pilih foto pakaian dari galeri.');
      return;
    }
    if (!name.trim()) {
      setError('Nama pakaian wajib diisi.');
      return;
    }

    if (!color.trim()) {
      setError('Warna pakaian wajib diisi.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. High-reliability JSON + Base64 path (bypasses React Native FormDataPart issues completely)
      if (imageFile && imageFile.base64) {
        const mime = imageFile.mimeType || 'image/jpeg';
        const dataUri = `data:${mime};base64,${imageFile.base64}`;
        const response = await api.createWardrobeItem({
          name: name.trim(),
          category,
          color: color.trim(),
          description: description.trim(),
          image: dataUri,
        });

        if (response.success) {
          Alert.alert('Sukses', 'Pakaian berhasil ditambahkan ke koleksi!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
          return;
        }
      }

      // 2. Modern Blob / FormData fallback
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category', category);
      formData.append('color', color.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const filename = imageUri.split('/').pop() || 'wardrobe.jpg';
      try {
        const res = await fetch(imageUri);
        const blob = await res.blob();
        formData.append('image', blob, filename);
      } catch (blobErr) {
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type: 'image/jpeg',
        });
      }

      const response = await api.createWardrobeItem(formData);
      if (response.success) {
        Alert.alert('Sukses', 'Pakaian berhasil ditambahkan ke koleksi!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pakaian.');
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = CATEGORIES.filter(c => c !== 'All');

  return (
    <View style={styles.container}>
      <Header
        title="Tambah Pakaian"
        subtitle="Simpan ke lemari digitalmu"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Image Picker Area */}
        <View style={styles.imagePickerCard}>
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity activeOpacity={0.8} onPress={pickImage} style={styles.changeImageBadge}>
                <Ionicons name="camera-reverse" size={16} color="#FFFFFF" />
                <Text style={styles.changeImageText}>Ganti Foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity activeOpacity={0.8} onPress={pickImage} style={styles.uploadPlaceholder}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="cloud-upload-outline" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.uploadTitle}>Pilih Foto dari Galeri</Text>
              <Text style={styles.uploadSubtitle}>Format JPG, PNG, atau WEBP</Text>
            </TouchableOpacity>
          )}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        ) : null}

        {/* Input Form */}
        <CustomInput
          label="Nama Pakaian"
          placeholder="Contoh: Blus Sutra Putih Gading"
          value={name}
          onChangeText={(val) => { setName(val); setError(''); }}
        />

        {/* Category Picker Chips */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Kategori</Text>
          <View style={styles.chipsRow}>
            {availableCategories.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.7}
                  onPress={() => setCategory(cat)}
                  style={[styles.chip, isSelected && styles.chipActive]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Color Input */}
        <CustomInput
          label="Warna Pakaian"
          placeholder="Contoh: Putih, Hitam, Beige, Sage Green"
          value={color}
          onChangeText={(val) => { setColor(val); setError(''); }}
        />

        {/* Optional Description */}
        <CustomInput
          label="Deskripsi / Catatan (Opsional)"
          placeholder="Contoh: Bahan linen lembut, cocok untuk cuaca panas atau semi formal"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Save Button */}
        <CustomButton
          title={loading ? 'Mengunggah & Menyimpan...' : 'Simpan ke Wardrobe'}
          onPress={handleSave}
          loading={loading}
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
  imagePickerCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  previewContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changeImageBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 34, 36, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  changeImageText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceWarm,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    marginTop: SPACING.sm,
  },
});
