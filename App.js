import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProductProvider } from './context/ProductContext';

// Import Screens
import HomeScreen from './screens/HomeScreen';
import CategoryProductsScreen from './screens/CategoryProductsScreen';
import AddProductScreen from './screens/AddProductScreen';
import ComparisonScreen from './screens/ComparisonScreen';

// Create Stack Navigator
const Stack = createStackNavigator();

// App Navigator Component
const AppNavigator = () => {
  const { isDarkMode } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer>
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
    // Wrap app with Context Providers
    // ThemeProvider: Manages dark mode and color themes
    // ProductProvider: Manages products state and operations
    <ThemeProvider>
      <ProductProvider>
        <AppNavigator />
      </ProductProvider>
    </ThemeProvider>
  );
}
