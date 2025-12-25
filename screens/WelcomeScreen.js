import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const WelcomeScreen = ({ onFinish }) => {
  const { colors } = useTheme();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto close after 2 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <Image 
          source={require('../assets/Logo/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* App Name */}
        <Text style={[styles.appName, { color: colors.primary }]}>
          CompareShop
        </Text>
        
        {/* Tagline */}
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Your pocket shopping assistant.
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    marginLeft: -20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
});

export default WelcomeScreen;
