import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackProductAdded } from '../utils/reviewPrompt';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Load categories from AsyncStorage on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Save categories to AsyncStorage whenever they change
  useEffect(() => {
    saveCategories();
  }, [categories]);

  const loadCategories = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@categories');
      if (jsonValue != null) {
        setCategories(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  };

  const saveCategories = async () => {
    try {
      const jsonValue = JSON.stringify(categories);
      await AsyncStorage.setItem('@categories', jsonValue);
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  };

  // Add a new category
  const addCategory = (name) => {
    const newCategory = {
      id: Date.now().toString(),
      name: name,
      products: [],
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    setCategories([...categories, newCategory]);
  };

  // Update a category name
  const updateCategory = (categoryId, newName) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, name: newName }
        : cat
    ));
  };

  // Delete a category and all its products
  const deleteCategory = (categoryId) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    // Remove any selected products that were in this category
    const categoryProducts = getCategoryProducts(categoryId);
    const productIds = categoryProducts.map(p => p.id);
    setSelectedProducts(selectedProducts.filter(id => !productIds.includes(id)));
  };

  // Toggle pin status of a category
  const togglePinCategory = (categoryId) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, pinned: !cat.pinned }
        : cat
    ));
  };

  // Add a product to a category
  const addProduct = (categoryId, brand, price, quantity, unit, discount = 0, notes = '') => {
    const numPrice = parseFloat(price);
    const discountAmount = (numPrice * parseFloat(discount)) / 100;
    const finalPrice = numPrice - discountAmount;
    
    const newProduct = {
      id: Date.now().toString(),
      brand: brand || '',
      price: numPrice,
      discount: parseFloat(discount),
      finalPrice: finalPrice,
      quantity: parseFloat(quantity),
      unit: unit,
      unitPrice: calculateUnitPrice(finalPrice, parseFloat(quantity), unit),
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, products: [...cat.products, newProduct] }
        : cat
    ));
    
    // Track product added for review prompt
    trackProductAdded();
  };

  // Update a product
  const updateProduct = (categoryId, productId, brand, price, quantity, unit, discount = 0, notes = '') => {
    const numPrice = parseFloat(price);
    const discountAmount = (numPrice * parseFloat(discount)) / 100;
    const finalPrice = numPrice - discountAmount;
    
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            products: cat.products.map(product =>
              product.id === productId
                ? {
                    ...product,
                    brand: brand || '',
                    price: numPrice,
                    discount: parseFloat(discount),
                    finalPrice: finalPrice,
                    quantity: parseFloat(quantity),
                    unit: unit,
                    unitPrice: calculateUnitPrice(finalPrice, parseFloat(quantity), unit),
                    notes: notes || '',
                  }
                : product
            )
          }
        : cat
    ));
  };

  // Delete a product from a category
  const deleteProduct = (categoryId, productId) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            products: cat.products.filter(product => product.id !== productId)
          }
        : cat
    ));
    // Remove from selected products if it was selected
    setSelectedProducts(selectedProducts.filter(id => id !== productId));
  };

  // Get all products from a specific category
  const getCategoryProducts = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.products : [];
  };

  // Get selected products data from a category
  const getSelectedProductsData = (categoryId) => {
    const products = getCategoryProducts(categoryId);
    return products.filter(product => selectedProducts.includes(product.id));
  };

  // Find the best value product in a category (lowest unit price)
  const getBestValueProductId = (categoryId) => {
    const products = getCategoryProducts(categoryId);
    if (products.length === 0) return null;

    let bestProduct = products[0];
    for (let i = 1; i < products.length; i++) {
      if (products[i].unitPrice < bestProduct.unitPrice) {
        bestProduct = products[i];
      }
    }
    return bestProduct.id;
  };

  // Calculate unit price (standardized to per single unit)
  const calculateUnitPrice = (price, quantity, unit) => {
    let normalizedQuantity = quantity;
    
    // Normalize to base units (g, ml, pcs)
    switch(unit.toLowerCase()) {
      case 'kg':
        normalizedQuantity = quantity * 1000; // Convert to grams
        break;
      case 'l':
        normalizedQuantity = quantity * 1000; // Convert to ml
        break;
    }

    // Calculate price per single base unit
    return price / normalizedQuantity;
  };

  // Toggle product selection for comparison
  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      // Limit to 5 products for comparison
      if (selectedProducts.length < 5) {
        setSelectedProducts([...selectedProducts, productId]);
      }
    }
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedProducts([]);
  };

  // Format unit price for display
  const formatUnitPrice = (unitPrice, unit, currencySymbol = '$') => {
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
      default:
        displayUnit = '/unit';
    }
    return `${currencySymbol}${unitPrice.toFixed(4)}${displayUnit}`;
  };

  const value = {
    categories,
    selectedProducts,
    addCategory,
    updateCategory,
    deleteCategory,
    togglePinCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    getCategoryProducts,
    getSelectedProductsData,
    getBestValueProductId,
    toggleProductSelection,
    clearSelection,
    formatUnitPrice,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
