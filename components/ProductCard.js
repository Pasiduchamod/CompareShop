import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';

// ProductCard component to display individual product information
const ProductCard = ({ product, onEdit, onDelete, onToggleSelect, isSelected, isBestValue, categoryName }) => {
  const { colors } = useTheme();
  const { formatUnitPrice } = useProducts();

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.cardBackground,
          borderColor: isBestValue ? colors.bestValueBorder : colors.border,
          borderWidth: isBestValue ? 2 : 1,
        },
        isBestValue && { backgroundColor: colors.bestValue }
      ]}
      onPress={onToggleSelect}
      activeOpacity={0.7}
    >
      {/* Best value indicator */}
      {isBestValue && (
        <View style={[styles.bestValueBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.bestValueText}>✓ BEST VALUE</Text>
        </View>
      )}

      {/* Product brand or category */}
      <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
        {product.brand || categoryName || 'Generic'}
      </Text>

      {/* Product details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Price</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            ${product.price.toFixed(2)}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Quantity</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {product.quantity} {product.unit}
          </Text>
        </View>
      </View>

      {/* Unit price - highlighted */}
      <View style={[styles.unitPriceContainer, { backgroundColor: colors.secondary + '20' }]}>
        <Text style={[styles.unitPriceLabel, { color: colors.textSecondary }]}>Unit Price</Text>
        <Text style={[styles.unitPrice, { color: colors.secondary }]}>
          {formatUnitPrice(product.unitPrice, product.unit)}
        </Text>
      </View>

      {/* Selection indicator */}
      {isSelected && (
        <View style={[styles.selectedBadge, { backgroundColor: colors.secondary }]}>
          <Text style={styles.selectedText}>✓</Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={onEdit}
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onDelete}
          style={[styles.actionButton, { backgroundColor: colors.buttonDanger }]}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 3,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  unitPriceContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  unitPriceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  unitPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ProductCard;
