import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen, EditProfileScreen, NotificationsScreen } from '../screens';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import AccountScreen from '../screens/profile/AccountScreen';
import TrainingPreferencesScreen from '../screens/profile/TrainingPreferencesScreen';
import ManageTracksScreen from '../screens/profile/ManageTracksScreen';
import TrackSelectorScreen from '../screens/training/TrackSelectorScreen';

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen 
        name="ProfileHome" 
        component={ProfileScreen} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
      />
      <Stack.Screen 
        name="Privacy" 
        component={PrivacyScreen} 
      />
      <Stack.Screen 
        name="Account" 
        component={AccountScreen} 
      />
      <Stack.Screen 
        name="TrainingPreferences" 
        component={TrainingPreferencesScreen} 
      />
      <Stack.Screen 
        name="ManageTracks" 
        component={ManageTracksScreen}
        options={{
          headerShown: true,
          title: 'Manage Tracks',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="TrackSelector" 
        component={TrackSelectorScreen}
        options={{
          headerShown: true,
          title: 'Choose Tracks',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack; 