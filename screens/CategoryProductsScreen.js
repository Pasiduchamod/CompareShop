import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';
import { useCurrency } from '../context/CurrencyContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

// Category Products Screen - shows products within a category
const CategoryProductsScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const { colors } = useTheme();
  const { currency } = useCurrency();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { 
    getCategoryProducts,
    deleteProduct, 
    selectedProducts, 
    toggleProductSelection,
    clearSelection,
    getBestValueProductId
  } = useProducts();

  const products = getCategoryProducts(category.id);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        (product.brand && product.brand.toLowerCase().includes(query)) ||
        (product.notes && product.notes.toLowerCase().includes(query))
      );
    }

    // Price range filter
    if (minPrice !== '' || maxPrice !== '') {
      const min = minPrice === '' ? 0 : parseFloat(minPrice) || 0;
      const max = maxPrice === '' ? Infinity : parseFloat(maxPrice) || Infinity;
      
      filtered = filtered.filter(product => {
        // Use finalPrice if available (after discount), otherwise use price
        const productPrice = product.finalPrice !== undefined ? product.finalPrice : product.price;
        return productPrice >= min && productPrice <= max;
      });
    }

    return filtered;
  }, [products, searchQuery, minPrice, maxPrice]);

  // Clear all filters
  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setShowFilters(false);
  };

  // Check if any filters are active
  const hasActiveFilters = minPrice !== '' || maxPrice !== '';

  // Navigate to Add Product screen
  const handleAddProduct = () => {
    navigation.navigate('AddProduct', { categoryId: category.id, categoryName: category.name });
  };

  // Navigate to Edit Product screen
  const handleEditProduct = (product) => {
    navigation.navigate('AddProduct', { 
      categoryId: category.id, 
      categoryName: category.name,
      product 
    });
  };

  // Delete product with confirmation
  const handleDeleteProduct = (productId, brand) => {
    const displayName = brand || 'this item';
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${displayName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteProduct(category.id, productId)
        },
      ]
    );
  };

  // Navigate to Comparison screen
  const handleCompare = () => {
    if (selectedProducts.length < 2) {
      Alert.alert(
        'Select Products',
        'Please select at least 2 products to compare.',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate('Comparison', { categoryId: category.id, categoryName: category.name });
  };

  // Toggle product selection
  const handleToggleSelect = (productId) => {
    const currentCount = selectedProducts.length;
    const isCurrentlySelected = selectedProducts.includes(productId);
    
    if (!isCurrentlySelected && currentCount >= 5) {
      Alert.alert(
        'Selection Limit',
        'You can only compare up to 5 products at a time.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    toggleProductSelection(productId);
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyIcon]}>📦</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Items Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Add different brands of {category.name} to compare
      </Text>
    </View>
  );

  // Render individual product card
  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onEdit={() => handleEditProduct(item)}
      onDelete={() => handleDeleteProduct(item.id, item.brand)}
      onToggleSelect={() => handleToggleSelect(item.id)}
      isSelected={selectedProducts.includes(item.id)}
      isBestValue={item.id === getBestValueProductId(category.id)}
      categoryName={category.name}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Header title={category.name} />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.inputBackground }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by brand or notes..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: hasActiveFilters ? colors.primary : colors.inputBackground }]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={[styles.filterIcon, { color: hasActiveFilters ? '#FFFFFF' : colors.text }]}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <View style={[styles.activeFiltersBar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.activeFiltersText, { color: colors.primary }]}>
            Filters active: {minPrice && `Min ${currency.symbol}${minPrice}`}{minPrice && maxPrice && ' | '}{maxPrice && `Max ${currency.symbol}${maxPrice}`}
          </Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Products list */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredProducts.length === 0 && styles.listContentEmpty,
          { paddingBottom: selectedProducts.length > 0 ? 120 : 100 }
        ]}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Add Button */}
      {selectedProducts.length === 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 20 }]}
          onPress={handleAddProduct}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* Comparison button - shown when products are selected */}
      {selectedProducts.length > 0 && (
        <View style={[styles.bottomBar, { backgroundColor: colors.cardBackground, borderTopColor: colors.border, paddingBottom: insets.bottom }]}>
          <View style={styles.bottomBarContent}>
            <View>
              <Text style={[styles.selectedCount, { color: colors.text }]}>
                {selectedProducts.length} Selected
              </Text>
              <TouchableOpacity onPress={clearSelection}>
                <Text style={[styles.clearText, { color: colors.secondary }]}>
                  Clear Selection
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={handleCompare}
              style={[styles.compareButton, { backgroundColor: colors.primary }]}
              disabled={selectedProducts.length < 2}
            >
              <Text style={styles.compareButtonText}>
                Compare ({selectedProducts.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity 
          style={styles.modalOverlayTouchable} 
          activeOpacity={1} 
          onPress={() => setShowFilters(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Filter Products
                </Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                {/* Price Range Filter */}
                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { color: colors.text }]}>
                    Price Range
                  </Text>
                  
                  <View style={styles.priceRangeContainer}>
                    <View style={styles.priceInputWrapper}>
                      <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Min Price</Text>
                      <TextInput
                        style={[styles.priceInput, { 
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.inputBorder,
                          color: colors.text
                        }]}
                        placeholder="0.00"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={minPrice}
                        onChangeText={setMinPrice}
                      />
                    </View>

                    <Text style={[styles.priceSeparator, { color: colors.textSecondary }]}>to</Text>

                    <View style={styles.priceInputWrapper}>
                      <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Max Price</Text>
                      <TextInput
                        style={[styles.priceInput, { 
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.inputBorder,
                          color: colors.text
                        }]}
                        placeholder="999.99"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Modal Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={handleClearFilters}
                  style={[styles.modalButton, styles.clearButton, { backgroundColor: colors.inputBackground }]}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowFilters(false)}
                  style={[styles.modalButton, styles.applyButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    Apply Filters
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  bottomBar: {
    borderTopWidth: 1,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  compareButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  compareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearIcon: {
    fontSize: 16,
    color: '#9CA3AF',
    paddingHorizontal: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  activeFiltersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeFiltersText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 400,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 24,
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  priceInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
  },
  priceSeparator: {
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  applyButton: {
    elevation: 2,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default CategoryProductsScreen;
