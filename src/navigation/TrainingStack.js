import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  TrainingHomeScreen,
  TrackSelectorScreen,
  WorkoutPreviewScreen,
  WorkoutPlayerScreen,
  WorkoutCompleteScreen,
  WorkoutHistoryScreen,
} from '../screens';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const TrainingStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="TrainingHome"
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
        name="TrainingHome" 
        component={TrainingHomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="TrackSelector" 
        component={TrackSelectorScreen}
        options={{
          title: 'Choose Your Track',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="WorkoutPreview" 
        component={WorkoutPreviewScreen}
        options={{
          title: 'Workout Preview',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="WorkoutPlayer" 
        component={WorkoutPlayerScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent accidental swipe during workout
        }}
      />
      <Stack.Screen 
        name="WorkoutComplete" 
        component={WorkoutCompleteScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Force user to use provided navigation
        }}
      />
      <Stack.Screen 
        name="WorkoutHistory" 
        component={WorkoutHistoryScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default TrainingStack; 