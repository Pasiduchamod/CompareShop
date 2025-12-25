import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet,
  TouchableOpacity 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';
import Header from '../components/Header';

// Comparison Screen - compare selected products side by side
const ComparisonScreen = ({ navigation, route }) => {
  const { categoryId, categoryName } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { getSelectedProductsData, formatUnitPrice, getBestValueProductId, clearSelection } = useProducts();
  
  const selectedProducts = getSelectedProductsData(categoryId);
  const bestValueId = getBestValueProductId(categoryId);

  // Handle close - clear selection and go back
  const handleClose = () => {
    clearSelection();
    navigation.goBack();
  };

  // Render comparison table row
  const renderComparisonRow = (label, getValue) => (
    <View style={styles.tableRow}>
      <View style={[styles.tableCell, styles.labelCell, { backgroundColor: colors.inputBackground }]}>
        <Text style={[styles.labelText, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      {selectedProducts.map((product) => (
        <View 
          key={product.id} 
          style={[
            styles.tableCell, 
            { borderColor: colors.border },
            product.id === bestValueId && label === 'Unit Price' && { backgroundColor: colors.bestValue }
          ]}
        >
          <Text 
            style={[
              styles.cellText, 
              { color: colors.text },
              product.id === bestValueId && label === 'Unit Price' && styles.bestValueText
            ]}
            numberOfLines={2}
          >
            {getValue(product)}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Header title={`Compare ${categoryName}`} />

      {/* Info banner */}
      <View style={[styles.infoBanner, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>
          📊 Comparing {selectedProducts.length} {categoryName.toLowerCase()} items
        </Text>
        <Text style={[styles.infoSubtext, { color: colors.textSecondary }]}>
          Best value is highlighted
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Product Names Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.labelCell, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.headerText, { color: colors.text }]}>Brand</Text>
            </View>
            {selectedProducts.map((product) => (
              <View 
                key={product.id} 
                style={[
                  styles.tableCell, 
                  styles.productNameCell,
                  { 
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  }
                ]}
              >
                <Text 
                  style={[styles.productName, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {product.brand || 'Generic'}
                </Text>
                {product.id === bestValueId && (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>✓ BEST</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Comparison Rows */}
          {renderComparisonRow('Price', (p) => `$${p.price.toFixed(2)}`)}
          {renderComparisonRow('Quantity', (p) => `${p.quantity} ${p.unit}`)}
          {renderComparisonRow('Unit Price', (p) => formatUnitPrice(p.unitPrice, p.unit))}
          
          {/* Savings calculation (compared to most expensive) */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.labelCell, { backgroundColor: colors.secondary + '20' }]}>
              <Text style={[styles.labelText, { color: colors.secondary, fontWeight: 'bold' }]}>
                Savings
              </Text>
            </View>
            {selectedProducts.map((product) => {
              const maxUnitPrice = Math.max(...selectedProducts.map(p => p.unitPrice));
              const savings = maxUnitPrice - product.unitPrice;
              const savingsPercent = ((savings / maxUnitPrice) * 100).toFixed(0);
              
              return (
                <View 
                  key={product.id} 
                  style={[
                    styles.tableCell, 
                    { 
                      borderColor: colors.border,
                      backgroundColor: savings > 0 ? colors.success + '15' : 'transparent'
                    }
                  ]}
                >
                  {savings > 0 ? (
                    <View>
                      <Text style={[styles.cellText, { color: colors.success, fontWeight: 'bold' }]}>
                        -{savingsPercent}%
                      </Text>
                      <Text style={[styles.savingsSubtext, { color: colors.textSecondary }]}>
                        Save ${savings.toFixed(2)}/unit
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.cellText, { color: colors.textSecondary }]}>
                      Most expensive
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Close Button */}
      <View style={[styles.footer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border, paddingBottom: insets.bottom }]}>
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
  infoBanner: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
  },
  table: {
    padding: 16,
    minWidth: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tableCell: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    minHeight: 60,
    justifyContent: 'center',
  },
  labelCell: {
    width: 100,
    marginRight: 8,
  },
  productNameCell: {
    width: 150,
    minHeight: 80,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cellText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bestValueText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  savingsSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  closeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ComparisonScreen;
