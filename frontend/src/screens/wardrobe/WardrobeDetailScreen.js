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
import { formatDateIndonesian } from '../../utils/helpers';
import Header from '../../components/Header';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function WardrobeDetailScreen({ route, navigation }) {
  const { itemId } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDetail();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDetail();
    });
    return unsubscribe;
  }, [itemId, navigation]);

  const fetchDetail = async () => {
    try {
      const res = await api.getWardrobeItemById(itemId);
      if (res.success && res.data) {
        setItem(res.data);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Gagal memuat detail pakaian.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Pakaian',
      'Apakah Anda yakin ingin menghapus pakaian ini dari wardrobe? Foto dan relasi pada outfit terkait juga akan dihapus.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const res = await api.deleteWardrobeItem(itemId);
              if (res.success) {
                Alert.alert('Sukses', 'Pakaian berhasil dihapus.');
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
        <Header title="Detail Pakaian" onBack={() => navigation.goBack()} />
        <LoadingSpinner message="Memuat detail pakaian..." fullScreen />
      </View>
    );
  }

  if (!item) return null;

  return (
    <View style={styles.container}>
      <Header
        title={item.name}
        onBack={() => navigation.goBack()}
        rightIcon="create-outline"
        onRightPress={() => navigation.navigate('EditWardrobe', { item })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Large Visual Image */}
        <View style={styles.imageCard}>
          <Image source={{ uri: item.image_url }} style={styles.fullImage} resizeMode="cover" />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.infoCard}>
          <Text style={styles.itemName}>{item.name}</Text>

          <View style={styles.attributesRow}>
            <View style={styles.attributeItem}>
              <Text style={styles.attrLabel}>Kategori</Text>
              <Text style={styles.attrValue}>{item.category}</Text>
            </View>

            <View style={styles.dividerVertical} />

            <View style={styles.attributeItem}>
              <Text style={styles.attrLabel}>Warna</Text>
              <Text style={styles.attrValue}>{item.color || '-'}</Text>
            </View>

            <View style={styles.dividerVertical} />

            <View style={styles.attributeItem}>
              <Text style={styles.attrLabel}>Ditambahkan</Text>
              <Text style={styles.attrValue}>{formatDateIndonesian(item.created_at)}</Text>
            </View>
          </View>

          {item.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.descTitle}>Deskripsi</Text>
              <Text style={styles.descText}>{item.description}</Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <CustomButton
              title="Edit Pakaian"
              variant="outline"
              icon={<Ionicons name="create-outline" size={18} color={COLORS.primaryDark} />}
              onPress={() => navigation.navigate('EditWardrobe', { item })}
              style={styles.actionBtn}
            />

            <CustomButton
              title="Hapus Pakaian"
              variant="danger"
              icon={<Ionicons name="trash-outline" size={18} color={COLORS.error} />}
              loading={deleting}
              onPress={handleDelete}
              style={styles.actionBtn}
            />
          </View>
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
  imageCard: {
    width: '100%',
    height: 320,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceWarm,
    position: 'relative',
    ...SHADOWS.card,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.subtle,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  attributesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  attributeItem: {
    flex: 1,
    alignItems: 'center',
  },
  dividerVertical: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.divider,
  },
  attrLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  attrValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: SPACING.lg,
  },
  descTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  descText: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'column',
    marginTop: SPACING.sm,
  },
  actionBtn: {
    marginBottom: 10,
  },
});
