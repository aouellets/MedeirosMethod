import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  StoreHomeScreen,
  ProductDetailScreen,
  CartScreen,
  SponsorProductsScreen,
} from '../screens';
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
          title: 'Product Details',
          headerBackTitle: 'Store',
        }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          title: 'Shopping Cart',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="SponsorProducts" 
        component={SponsorProductsScreen}
        options={({ route }) => ({
          title: route.params?.sponsor === 'all' ? 'Partner Products' : 'Sponsor Products',
          headerBackTitle: 'Store',
        })}
      />
      {/* 
      Future Commerce Screens:
      - ProductGrid (category view)
      - Checkout
      - OrderConfirmed
      - OrderHistory
      - ProductReviews
      */}
    </Stack.Navigator>
  );
};

export default CommerceStack; 