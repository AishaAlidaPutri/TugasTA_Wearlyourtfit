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

export default function EditWardrobeScreen({ route, navigation }) {
  const { item } = route.params;
  const [imageUri, setImageUri] = useState(item.image_url);
  const [hasNewImage, setHasNewImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [color, setColor] = useState(item.color || '');
  const [description, setDescription] = useState(item.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Izin Dibutuhkan', 'Aplikasi memerlukan izin untuk mengakses galeri foto.');
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
        setImageUri(result.assets[0].uri);
        setImageFile(result.assets[0]);
        setHasNewImage(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Gagal memilih foto: ' + err.message);
    }
  };

  const handleUpdate = async () => {
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
      // 1. If no new image, send clean JSON update
      if (!hasNewImage) {
        const response = await api.updateWardrobeItem(item.id, {
          name: name.trim(),
          category,
          color: color.trim(),
          description: description.trim(),
        });
        if (response.success) {
          Alert.alert('Sukses', 'Informasi pakaian berhasil diperbarui!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
          return;
        }
      }

      // 2. If new image has base64, send clean JSON with base64 data URI
      if (hasNewImage && imageFile && imageFile.base64) {
        const mime = imageFile.mimeType || 'image/jpeg';
        const dataUri = `data:${mime};base64,${imageFile.base64}`;
        const response = await api.updateWardrobeItem(item.id, {
          name: name.trim(),
          category,
          color: color.trim(),
          description: description.trim(),
          image: dataUri,
        });
        if (response.success) {
          Alert.alert('Sukses', 'Informasi pakaian berhasil diperbarui!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
          return;
        }
      }

      // 3. Fallback: FormData with Blob
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category', category);
      formData.append('color', color.trim());
      formData.append('description', description.trim());

      if (hasNewImage) {
        const filename = imageUri.split('/').pop() || 'wardrobe_updated.jpg';
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
      }

      const response = await api.updateWardrobeItem(item.id, formData);
      if (response.success) {
        Alert.alert('Sukses', 'Informasi pakaian berhasil diperbarui!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      setError(err.message || 'Gagal memperbarui pakaian.');
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = CATEGORIES.filter(c => c !== 'All');

  return (
    <View style={styles.container}>
      <Header
        title="Edit Pakaian"
        subtitle={item.name}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Photo View / Change */}
        <View style={styles.imageCard}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
          <TouchableOpacity activeOpacity={0.8} onPress={pickImage} style={styles.changeBadge}>
            <Ionicons name="camera-reverse" size={16} color="#FFFFFF" />
            <Text style={styles.changeBadgeText}>Ganti Foto</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        ) : null}

        <CustomInput
          label="Nama Pakaian"
          value={name}
          onChangeText={setName}
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

        <CustomInput
          label="Deskripsi / Catatan"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <CustomButton
          title={loading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
          onPress={handleUpdate}
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
  imageCard: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceWarm,
    position: 'relative',
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changeBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 34, 36, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  changeBadgeText: {
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
