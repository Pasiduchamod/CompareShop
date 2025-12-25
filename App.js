import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProductProvider } from './context/ProductContext';
import { CurrencyProvider } from './context/CurrencyContext';

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
