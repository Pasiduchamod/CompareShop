import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CurrencyContext = createContext();

// Available currencies with their symbols and names (ordered by country)
export const CURRENCIES = [
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' },
  { code: 'BZD', symbol: 'BZ$', name: 'Belize Dollar' },
  { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' },
  { code: 'BAM', symbol: 'KM', name: 'Bosnia & Herzegovina Mark' },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'BND', symbol: 'B$', name: 'Brunei Dollar' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },
  { code: 'HNL', symbol: 'L', name: 'Honduran Lempira' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'IRR', symbol: '﷼', name: 'Iranian Rial' },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar' },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'KGS', symbol: 'с', name: 'Kyrgyzstani Som' },
  { code: 'LAK', symbol: '₭', name: 'Lao Kip' },
  { code: 'LBP', symbol: '£', name: 'Lebanese Pound' },
  { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
  { code: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca' },
  { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar' },
  { code: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa' },
  { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'MDL', symbol: 'L', name: 'Moldovan Leu' },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tögrög' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical' },
  { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat' },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar' },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'OMR', symbol: '﷼', name: 'Omani Rial' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa' },
  { code: 'PYG', symbol: '₲', name: 'Paraguayan Guaraní' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'GBP', symbol: '£', name: 'Pound Sterling' },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'RSD', symbol: 'дин.', name: 'Serbian Dinar' },
  { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad & Tobago Dollar' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
  { code: 'UZS', symbol: 'сўм', name: 'Uzbekistani Som' },
  { code: 'VES', symbol: 'Bs.S', name: 'Venezuelan Bolívar' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Đồng' },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
  { code: 'ZWL', symbol: 'Z$', name: 'Zimbabwean Dollar' },
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(
    CURRENCIES.find(c => c.code === 'USD') || CURRENCIES[0]
  ); // Default to USD

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
