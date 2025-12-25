import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Header component with logo and optional actions
const Header = ({ title, rightButton, onRightButtonPress }) => {
  const { colors, isDarkMode, toggleTheme } = useTheme();

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
});

export default Header;
