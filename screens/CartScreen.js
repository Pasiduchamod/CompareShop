import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';
import { useCurrency } from '../context/CurrencyContext';
import Header from '../components/Header';

// Cart/Bill Calculator Screen - calculate total bill before purchase
const CartScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { categories } = useProducts();
  const { currency, formatPrice } = useCurrency();
  const [selectedItems, setSelectedItems] = useState([]);

  // Get all products from all categories
  const allProducts = useMemo(() => {
    const products = [];
    categories.forEach(category => {
      if (category.products && category.products.length > 0) {
        category.products.forEach(product => {
          products.push({
            ...product,
            categoryName: category.name,
            categoryId: category.id
          });
        });
      }
    });
    return products;
  }, [categories]);

  // Toggle item selection
  const toggleItemSelection = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Select all items
  const selectAll = () => {
    setSelectedItems(allProducts.map(p => p.id));
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedItems([]);
  };

  // Calculate total bill
  const totalBill = useMemo(() => {
    return allProducts
      .filter(product => selectedItems.includes(product.id))
      .reduce((sum, product) => sum + (product.finalPrice || product.price), 0);
  }, [allProducts, selectedItems]);

  // Calculate total savings
  const totalSavings = useMemo(() => {
    return allProducts
      .filter(product => selectedItems.includes(product.id))
      .reduce((sum, product) => {
        if (product.discount > 0) {
          return sum + (product.price - product.finalPrice);
        }
        return sum;
      }, 0);
  }, [allProducts, selectedItems]);

  // Group products by category for display
  const groupedProducts = useMemo(() => {
    const groups = {};
    allProducts.forEach(product => {
      if (!groups[product.categoryName]) {
        groups[product.categoryName] = [];
      }
      groups[product.categoryName].push(product);
    });
    return Object.entries(groups).map(([categoryName, products]) => ({
      categoryName,
      products
    }));
  }, [allProducts]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Products Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Add products to categories to calculate your bill
      </Text>
    </View>
  );

  // Render individual product item
  const renderProduct = (product) => {
    const isSelected = selectedItems.includes(product.id);
    const displayPrice = product.finalPrice || product.price;

    return (
      <TouchableOpacity
        key={product.id}
        style={[
          styles.productItem,
          { 
            backgroundColor: isSelected ? colors.primary + '15' : colors.cardBackground,
            borderColor: isSelected ? colors.primary : colors.border
          }
        ]}
        onPress={() => toggleItemSelection(product.id)}
      >
        <View style={styles.checkboxContainer}>
          <View style={[
            styles.checkbox,
            { 
              borderColor: isSelected ? colors.primary : colors.border,
              backgroundColor: isSelected ? colors.primary : 'transparent'
            }
          ]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>

        <View style={styles.productDetails}>
          <Text style={[styles.productBrand, { color: colors.text }]}>
            {product.brand || product.categoryName}
          </Text>
          <Text style={[styles.productInfo, { color: colors.textSecondary }]}>
            {product.quantity} {product.unit}
          </Text>
          {product.discount > 0 && (
            <View style={styles.discountRow}>
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                {formatPrice(product.price)}
              </Text>
              <Text style={[styles.discountBadge, { color: colors.success }]}>
                -{product.discount}% OFF
              </Text>
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.productPrice, { color: colors.text }]}>
            {formatPrice(displayPrice)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render category section
  const renderCategorySection = ({ item }) => (
    <View style={styles.categorySection}>
      <Text style={[styles.categoryTitle, { color: colors.text }]}>
        {item.categoryName}
      </Text>
      {item.products.map(product => renderProduct(product))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Calculate Bill" />

      {allProducts.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Selection controls */}
          <View style={[styles.controlBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
            <Text style={[styles.itemCount, { color: colors.text }]}>
              {allProducts.length} {allProducts.length === 1 ? 'item' : 'items'}
            </Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity onPress={selectAll} style={styles.controlButton}>
                <Text style={[styles.controlButtonText, { color: colors.primary }]}>
                  Select All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearAll} style={styles.controlButton}>
                <Text style={[styles.controlButtonText, { color: colors.textSecondary }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Products list */}
          <FlatList
            data={groupedProducts}
            renderItem={renderCategorySection}
            keyExtractor={item => item.categoryName}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 140 }
            ]}
          />

          {/* Total bill footer */}
          <View style={[
            styles.billFooter,
            { 
              backgroundColor: colors.cardBackground,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 16
            }
          ]}>
            <View style={styles.billSummary}>
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: colors.textSecondary }]}>
                  Selected Items
                </Text>
                <Text style={[styles.billValue, { color: colors.text }]}>
                  {selectedItems.length}
                </Text>
              </View>

              {totalSavings > 0 && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: colors.success }]}>
                    💰 Total Savings
                  </Text>
                  <Text style={[styles.savingsValue, { color: colors.success }]}>
                    -{formatPrice(totalSavings)}
                  </Text>
                </View>
              )}

              <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>
                  Total Bill
                </Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  {formatPrice(totalBill)}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productDetails: {
    flex: 1,
  },
  productBrand: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productInfo: {
    fontSize: 13,
    marginBottom: 4,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  billFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  billSummary: {
    padding: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 14,
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  savingsValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default CartScreen;
