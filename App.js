import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProductProvider } from './context/ProductContext';
import { CurrencyProvider } from './context/CurrencyContext';
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';

// Import Screens
import HomeScreen from './screens/HomeScreen';
import CategoryProductsScreen from './screens/CategoryProductsScreen';
import AddProductScreen from './screens/AddProductScreen';
import ComparisonScreen from './screens/ComparisonScreen';
import CartScreen from './screens/CartScreen';

// Create Stack Navigator
const Stack = createStackNavigator();

// App Navigator Component
const AppNavigator = () => {
  const { isDarkMode, colors } = useTheme();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(null);

  // Check if onboarding has been completed
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem('@onboarding_completed');
      setShowOnboarding(hasCompletedOnboarding === null);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  // Show onboarding first if it's the first launch
  if (showOnboarding === null) {
    // Still checking, return null or a loading screen
    return null;
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={() => setShowOnboarding(false)} />;
  }

  // If welcome screen is still showing, render it
  if (showWelcome) {
    return <WelcomeScreen onFinish={() => setShowWelcome(false)} />;
  }

  return (
    <>
      <StatusBar 
        style={isDarkMode ? 'light' : 'dark'} 
        backgroundColor={colors.background}
      />
      <NavigationContainer
        theme={{
          dark: isDarkMode,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.cardBackground,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false, // We use custom headers
            cardStyle: { backgroundColor: 'transparent' },
            animationEnabled: true,
          }}
        >
          {/* Home Screen - List of categories */}
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
          />
          
          {/* Category Products Screen - Products within a category */}
          <Stack.Screen 
            name="CategoryProducts" 
            component={CategoryProductsScreen}
          />
          
          {/* Cart/Bill Calculator Screen */}
          <Stack.Screen 
            name="Cart" 
            component={CartScreen}
          />
          
          {/* Add/Edit Product Screen */}
          <Stack.Screen 
            name="AddProduct" 
            component={AddProductScreen}
            options={{
              presentation: 'modal', // Modal presentation on iOS
            }}
          />
          
          {/* Comparison Screen */}
          <Stack.Screen 
            name="Comparison" 
            component={ComparisonScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      {/* Wrap app with Context Providers */}
      {/* ThemeProvider: Manages dark mode and color themes */}
      {/* ProductProvider: Manages products state and operations */}
      {/* CurrencyProvider: Manages currency selection */}
      <ThemeProvider>
        <CurrencyProvider>
          <ProductProvider>
            <AppNavigator />
          </ProductProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
