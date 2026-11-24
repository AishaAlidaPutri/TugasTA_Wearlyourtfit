import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { CATEGORIES } from '../../utils/helpers';
import { api } from '../../services/api';
import WardrobeCard from '../../components/WardrobeCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function WardrobeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const androidBar = StatusBar.currentHeight || 28;
  const topPadding = Platform.OS === 'android'
    ? androidBar + 22
    : Math.max(insets.top, 20) + SPACING.xs;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWardrobe = useCallback(async () => {
    try {
      const res = await api.getWardrobeItems({
        category: selectedCategory,
        search: searchQuery,
      });
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.warn('Error fetching wardrobe items:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchWardrobe();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchWardrobe();
    });
    return unsubscribe;
  }, [navigation, fetchWardrobe]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWardrobe();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle}>My Wardrobe</Text>
          <Text style={styles.screenSubtitle}>
            Koleksi pakaian digitalmu. Total {items.length} item pakaian tersimpan.
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddWardrobe')}
          style={styles.addButton}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          placeholder="Cari nama pakaian atau warna..."
          placeholderTextColor={COLORS.textPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={fetchWardrobe}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoryScrollContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Clothing Grid */}
      {loading ? (
        <LoadingSpinner message="Menghubungkan ke lemari pakaian..." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accentGold} />
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <WardrobeCard
                item={item}
                onPress={() => navigation.navigate('WardrobeDetail', { itemId: item.id })}
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="shirt-outline"
              title="Lemari Masih Kosong"
              description={
                selectedCategory !== 'All' || searchQuery
                  ? 'Tidak ada pakaian yang cocok dengan filter atau pencarian Anda.'
                  : 'Mulai bangun lemari digitalmu dengan menambahkan pakaian pertamamu!'
              }
              actionTitle="Tambah Pakaian Baru"
              onAction={() => navigation.navigate('AddWardrobe')}
            />
          }
        />
      )}
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
    paddingBottom: SPACING.xs,
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
    lineHeight: 16,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
  },
  categoryScrollContainer: {
    marginBottom: SPACING.sm,
  },
  categoryList: {
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceWarm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gridContent: {
    padding: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  cardWrapper: {
    flex: 0.5,
    padding: SPACING.xs,
  },
});
