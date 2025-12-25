import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

// Category Products Screen - shows products within a category
const CategoryProductsScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { 
    getCategoryProducts,
    deleteProduct, 
    selectedProducts, 
    toggleProductSelection,
    clearSelection,
    getBestValueProductId
  } = useProducts();

  const products = getCategoryProducts(category.id);

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

      {/* Products list */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          products.length === 0 && styles.listContentEmpty
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
