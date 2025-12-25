import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';
import Header from '../components/Header';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Comparison Screen - compare selected products in a user-friendly card layout
const ComparisonScreen = ({ navigation, route }) => {
  const { categoryId, categoryName } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { getSelectedProductsData, formatUnitPrice, clearSelection } = useProducts();
  
  const selectedProducts = getSelectedProductsData(categoryId);
  
  // Find best value among SELECTED products only (not all products in category)
  const bestValueProduct = selectedProducts.length > 0 
    ? selectedProducts.reduce((best, current) => 
        current.unitPrice < best.unitPrice ? current : best
      )
    : null;
  const bestValueId = bestValueProduct ? bestValueProduct.id : null;

  // Calculate max price for savings
  const maxUnitPrice = selectedProducts.length > 0 ? Math.max(...selectedProducts.map(p => p.unitPrice)) : 0;

  // Handle close - clear selection and go back
  const handleClose = () => {
    clearSelection();
    navigation.goBack();
  };

  // Render individual product card
  const renderProductCard = (product, index) => {
    const isBestValue = product.id === bestValueId;
    const savings = maxUnitPrice - product.unitPrice;
    const savingsPercent = savings > 0 ? ((savings / maxUnitPrice) * 100).toFixed(0) : 0;

    return (
      <View 
        key={product.id}
        style={[
          styles.productCard,
          { 
            backgroundColor: colors.cardBackground,
            borderColor: isBestValue ? colors.primary : colors.border,
            borderWidth: isBestValue ? 3 : 1,
          }
        ]}
      >
        {/* Best Value Badge */}
        {isBestValue && (
          <View style={[styles.bestBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.bestBadgeText}>⭐ BEST VALUE</Text>
          </View>
        )}

        {/* Rank Number */}
        <View style={[styles.rankBadge, { backgroundColor: colors.inputBackground }]}>
          <Text style={[styles.rankText, { color: colors.text }]}>#{index + 1}</Text>
        </View>

        {/* Brand Name */}
        <Text style={[styles.brandName, { color: colors.text }]}>
          {product.brand || categoryName}
        </Text>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Total Price</Text>
          <Text style={[styles.priceValue, { color: colors.text }]}>
            ${product.price.toFixed(2)}
          </Text>
        </View>

        {/* Quantity Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Quantity</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {product.quantity} {product.unit}
          </Text>
        </View>

        {/* Unit Price Section - Highlighted */}
        <View style={[
          styles.unitPriceSection,
          { 
            backgroundColor: isBestValue ? colors.primary + '20' : colors.inputBackground,
            borderColor: isBestValue ? colors.primary : colors.border
          }
        ]}>
          <Text style={[styles.unitPriceLabel, { color: colors.textSecondary }]}>
            Unit Price
          </Text>
          <Text style={[
            styles.unitPriceValue, 
            { color: isBestValue ? colors.primary : colors.text }
          ]}>
            {formatUnitPrice(product.unitPrice, product.unit)}
          </Text>
        </View>

        {/* Savings Section */}
        {savings > 0 ? (
          <View style={[styles.savingsSection, { backgroundColor: colors.success + '15' }]}>
            <Text style={[styles.savingsPercent, { color: colors.success }]}>
              Save {savingsPercent}%
            </Text>
            <Text style={[styles.savingsAmount, { color: colors.textSecondary }]}>
              ${savings.toFixed(4)}/unit cheaper
            </Text>
          </View>
        ) : (
          <View style={[styles.savingsSection, { backgroundColor: colors.error + '10' }]}>
            <Text style={[styles.expensiveText, { color: colors.error }]}>
              Most Expensive
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Header title="Comparison" />

      {/* Category Info */}
      <View style={[styles.categoryBanner, { backgroundColor: colors.primary + '15' }]}>
        <Text style={[styles.categoryText, { color: colors.text }]}>
          {categoryName}
        </Text>
        <Text style={[styles.categorySubtext, { color: colors.textSecondary }]}>
          {selectedProducts.length} items compared
        </Text>
      </View>

      {/* Products Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {selectedProducts
          .sort((a, b) => a.unitPrice - b.unitPrice) // Sort by unit price (best to worst)
          .map((product, index) => renderProductCard(product, index))}
      </ScrollView>

      {/* Close Button */}
      <View style={[
        styles.footer, 
        { 
          backgroundColor: colors.cardBackground, 
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + 16
        }
      ]}>
        <TouchableOpacity 
          onPress={handleClose}
          style={[styles.closeButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryBanner: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categorySubtext: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  productCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bestBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bestBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rankBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  priceSection: {
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  unitPriceSection: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  unitPriceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  unitPriceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  savingsSection: {
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  savingsPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 13,
  },
  expensiveText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  closeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ComparisonScreen;
