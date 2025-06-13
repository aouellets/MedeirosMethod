import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import { SplashScreen } from '../screens';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Show splash screen first, then handle loading/auth states
  if (showSplash) {
    return (
      <SplashScreen 
        onAnimationComplete={() => setShowSplash(false)} 
      />
    );
  }

  // Show loading state after splash
  if (isLoading) {
    return (
      <SplashScreen 
        onAnimationComplete={() => {}} 
      />
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // User is authenticated or continuing as guest - show main app
        <Stack.Screen 
          name="MainApp" 
          component={MainTabNavigator} 
        />
      ) : (
        // User is not authenticated - show auth flow
        <Stack.Screen 
          name="Auth" 
          component={AuthStack} 
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator; 