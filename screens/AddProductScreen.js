import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';
import { useCurrency } from '../context/CurrencyContext';
import Header from '../components/Header';

// Add/Edit Product Screen
const AddProductScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { addProduct, updateProduct } = useProducts();
  const { currency, formatPrice } = useCurrency();
  
  // Get category and product from route params
  const { categoryId, categoryName, product: productToEdit } = route.params;
  const isEditing = !!productToEdit;

  // Form state
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('g');

  // Available units
  const units = ['g', 'kg', 'ml', 'L', 'pcs'];

  // Load product data if editing
  useEffect(() => {
    if (productToEdit) {
      setBrand(productToEdit.brand || '');
      setPrice(productToEdit.price.toString());
      setQuantity(productToEdit.quantity.toString());
      setUnit(productToEdit.unit);
    }
  }, [productToEdit]);

  // Calculate and display unit price in real-time
  const calculatePreviewUnitPrice = () => {
    const numPrice = parseFloat(price);
    const numQuantity = parseFloat(quantity);
    
    if (isNaN(numPrice) || isNaN(numQuantity) || numQuantity === 0) {
      return 'Enter values to see unit price';
    }

    let normalizedQuantity = numQuantity;
    
    switch(unit.toLowerCase()) {
      case 'kg':
        normalizedQuantity = numQuantity * 1000;
        break;
      case 'l':
        normalizedQuantity = numQuantity * 1000;
        break;
    }

    const unitPrice = numPrice / normalizedQuantity;
    
    let displayUnit = '';
    switch(unit.toLowerCase()) {
      case 'kg':
      case 'g':
        displayUnit = '/g';
        break;
      case 'l':
      case 'ml':
        displayUnit = '/ml';
        break;
      case 'pcs':
        displayUnit = '/pcs';
        break;
    }
    
    return `${formatPrice(unitPrice, 4)}${displayUnit}`;
  };

  // Validate and save product
  const handleSave = () => {
    // Validation
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    // Save product
    if (isEditing) {
      updateProduct(categoryId, productToEdit.id, brand.trim(), price, quantity, unit);
      Alert.alert('Success', 'Product updated successfully');
    } else {
      addProduct(categoryId, brand.trim(), price, quantity, unit);
      Alert.alert('Success', 'Product added successfully');
    }

    // Navigate back
    navigation.goBack();
  };

  // Cancel and go back
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <Header title={isEditing ? `Edit ${categoryName}` : `Add ${categoryName}`} />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: colors.secondary + '15', borderColor: colors.secondary }]}>
            <Text style={[styles.infoBannerText, { color: colors.text }]}>
              Category: <Text style={{ fontWeight: 'bold' }}>{categoryName}</Text>
            </Text>
          </View>

          {/* Brand Name (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Brand (Optional)
            </Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.inputText
                }
              ]}
              placeholder="e.g., Nestle, Arla, Generic"
              placeholderTextColor={colors.textSecondary}
              value={brand}
              onChangeText={setBrand}
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Price ({currency.symbol}) *
            </Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.inputText
                }
              ]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Quantity and Unit */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex2]}>
              <Text style={[styles.label, { color: colors.text }]}>
                Quantity *
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.inputText
                  }
                ]}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={[styles.label, { color: colors.text }]}>
                Unit *
              </Text>
              <View style={styles.unitSelector}>
                {units.map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setUnit(u)}
                    style={[
                      styles.unitButton,
                      { 
                        backgroundColor: unit === u ? colors.primary : colors.inputBackground,
                        borderColor: unit === u ? colors.primary : colors.inputBorder,
                      }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.unitText,
                        { color: unit === u ? '#FFFFFF' : colors.text }
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Unit Price Preview */}
          <View style={[styles.previewContainer, { backgroundColor: colors.secondary + '15', borderColor: colors.secondary }]}>
            <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
              Unit Price Preview
            </Text>
            <Text style={[styles.previewValue, { color: colors.secondary }]}>
              {calculatePreviewUnitPrice()}
            </Text>
            <Text style={[styles.previewHint, { color: colors.textSecondary }]}>
              This helps you compare prices fairly
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              onPress={handleCancel}
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSave}
              style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                {isEditing ? 'Update' : 'Add'} Product
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoBannerText: {
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  previewValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProductScreen;
