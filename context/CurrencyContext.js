import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CurrencyContext = createContext();

// Available currencies with their symbols and names
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(CURRENCIES[0]); // Default to USD

  // Load currency from AsyncStorage on mount
  useEffect(() => {
    loadCurrency();
  }, []);

  // Save currency to AsyncStorage whenever it changes
  useEffect(() => {
    saveCurrency();
  }, [currency]);

  const loadCurrency = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@currency');
      if (jsonValue != null) {
        const savedCurrency = JSON.parse(jsonValue);
        setCurrency(savedCurrency);
      }
    } catch (e) {
      console.error('Error loading currency:', e);
    }
  };

  const saveCurrency = async () => {
    try {
      const jsonValue = JSON.stringify(currency);
      await AsyncStorage.setItem('@currency', jsonValue);
    } catch (e) {
      console.error('Error saving currency:', e);
    }
  };

  const changeCurrency = (currencyCode) => {
    const selectedCurrency = CURRENCIES.find(c => c.code === currencyCode);
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
    }
  };

  // Format price with current currency
  const formatPrice = (price, decimals = 2) => {
    return `${currency.symbol}${parseFloat(price).toFixed(decimals)}`;
  };

  const value = {
    currency,
    currencies: CURRENCIES,
    changeCurrency,
    formatPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
