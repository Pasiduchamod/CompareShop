import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Theme Context to manage dark mode state across the app
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme Provider component that wraps the entire app
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from AsyncStorage on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  // Toggle dark mode and save preference
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Define color schemes for light and dark modes
  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      // Background colors
      background: isDarkMode ? '#121212' : '#F5F5F5',
      cardBackground: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      
      // Text colors
      text: isDarkMode ? '#FFFFFF' : '#333333',
      textSecondary: isDarkMode ? '#B0B0B0' : '#666666',
      
      // Primary colors (green + blue)
      primary: '#4CAF50', // Green
      secondary: '#2196F3', // Blue
      
      // Accent colors
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      
      // Border and divider colors
      border: isDarkMode ? '#333333' : '#E0E0E0',
      divider: isDarkMode ? '#2A2A2A' : '#E0E0E0',
      
      // Best value highlight
      bestValue: isDarkMode ? '#1B5E20' : '#C8E6C9',
      bestValueBorder: '#4CAF50',
      
      // Button colors
      buttonPrimary: '#4CAF50',
      buttonSecondary: '#2196F3',
      buttonDanger: '#F44336',
      
      // Input colors
      inputBackground: isDarkMode ? '#2A2A2A' : '#FFFFFF',
      inputBorder: isDarkMode ? '#404040' : '#CCCCCC',
      inputText: isDarkMode ? '#FFFFFF' : '#333333',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
