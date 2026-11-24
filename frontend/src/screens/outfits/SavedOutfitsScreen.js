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
import { OCCASIONS } from '../../utils/helpers';
import { api } from '../../services/api';
import OutfitCard from '../../components/OutfitCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SavedOutfitsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const androidBar = StatusBar.currentHeight || 28;
  const topPadding = Platform.OS === 'android'
    ? androidBar + 22
    : Math.max(insets.top, 20) + SPACING.xs;

  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOutfits = useCallback(async () => {
    try {
      const res = await api.getOutfits({
        occasion: selectedOccasion,
        search: searchQuery,
      });
      if (res.success && res.data) {
        setOutfits(res.data);
      }
    } catch (err) {
      console.warn('Error fetching outfits:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedOccasion, searchQuery]);

  useEffect(() => {
    fetchOutfits();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOutfits();
    });
    return unsubscribe;
  }, [navigation, fetchOutfits]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOutfits();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle}>Saved Outfits</Text>
          <Text style={styles.screenSubtitle}>
            Koleksi padu padan busanamu. Total {outfits.length} outfit terdaftar.
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('OutfitStudio')}
          style={styles.addButton}
        >
          <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.addButtonText}>Rancang</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          placeholder="Cari nama kombinasi outfit..."
          placeholderTextColor={COLORS.textPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={fetchOutfits}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Occasion Filter Chips */}
      <View style={styles.occasionScrollContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={OCCASIONS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.occasionList}
          renderItem={({ item }) => {
            const isSelected = selectedOccasion === item;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedOccasion(item)}
                style={[
                  styles.occasionChip,
                  isSelected && styles.occasionChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.occasionChipText,
                    isSelected && styles.occasionChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Outfits List */}
      {loading ? (
        <LoadingSpinner message="Menghubungkan ke outfit tersimpan..." />
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accentGold} />
          }
          renderItem={({ item }) => (
            <OutfitCard
              outfit={item}
              onPress={() => navigation.navigate('OutfitDetail', { outfitId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="sparkles-outline"
              title="Belum Ada Outfit"
              description={
                selectedOccasion !== 'All' || searchQuery
                  ? 'Tidak ada outfit yang cocok dengan filter Anda.'
                  : 'Padukan koleksi pakaianmu dan simpan kombinasi outfit pertamamu!'
              }
              actionTitle="Rancang Outfit Sekarang"
              onAction={() => navigation.navigate('OutfitStudio')}
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
  occasionScrollContainer: {
    marginBottom: SPACING.sm,
  },
  occasionList: {
    paddingHorizontal: SPACING.md,
  },
  occasionChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceWarm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  occasionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  occasionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  occasionChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
});
