import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  StoreHomeScreen,
  ProductDetailScreen,
  CartScreen,
  SponsorProductsScreen,
} from '../screens';
import CheckoutScreen from '../screens/commerce/CheckoutScreen';
import OrderConfirmationScreen from '../screens/commerce/OrderConfirmationScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const CommerceStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="StoreHome"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.boneWhite,
        },
        headerTintColor: colors.slateBlue,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="StoreHome" 
        component={StoreHomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="SponsorProducts" 
        component={SponsorProductsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="OrderConfirmation" 
        component={OrderConfirmationScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent going back after order completion
        }}
      />
      {/* 
      Future Commerce Screens:
      - ProductGrid (category view)
      - OrderHistory
      - ProductReviews
      */}
    </Stack.Navigator>
  );
};

export default CommerceStack; 