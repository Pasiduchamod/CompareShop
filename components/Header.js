import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

// Header component with logo and optional actions
const Header = ({ title, rightButton, onRightButtonPress }) => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { currency, currencies, changeCurrency } = useCurrency();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const handleCurrencySelect = (currencyCode) => {
    changeCurrency(currencyCode);
    setShowCurrencyPicker(false);
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
      <View style={styles.headerContent}>
        {/* Logo */}
        <Image 
          source={require('../assets/Logo/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        
        {/* Right side actions */}
        <View style={styles.rightActions}>
          {/* Currency selector */}
          <TouchableOpacity 
            onPress={() => setShowCurrencyPicker(true)}
            style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}
          >
            <Text style={styles.icon}>{currency.symbol}</Text>
          </TouchableOpacity>

          {/* Dark mode toggle */}
          <TouchableOpacity 
            onPress={toggleTheme}
            style={[styles.iconButton, { backgroundColor: colors.inputBackground }]}
          >
            <Text style={styles.icon}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          
          {/* Optional right button */}
          {rightButton && (
            <TouchableOpacity 
              onPress={onRightButtonPress}
              style={[styles.iconButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.iconWhite}>{rightButton}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Currency
            </Text>
            <FlatList
              data={currencies}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyItem,
                    { 
                      backgroundColor: item.code === currency.code 
                        ? colors.primary + '20' 
                        : 'transparent',
                      borderBottomColor: colors.border
                    }
                  ]}
                  onPress={() => handleCurrencySelect(item.code)}
                >
                  <Text style={[styles.currencySymbol, { color: colors.text }]}>
                    {item.symbol}
                  </Text>
                  <View style={styles.currencyInfo}>
                    <Text style={[styles.currencyCode, { color: colors.text }]}>
                      {item.code}
                    </Text>
                    <Text style={[styles.currencyName, { color: colors.textSecondary }]}>
                      {item.name}
                    </Text>
                  </View>
                  {item.code === currency.code && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setShowCurrencyPicker(false)}
              style={[styles.closeModalButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 15,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  iconWhite: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 40,
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 13,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Header;
