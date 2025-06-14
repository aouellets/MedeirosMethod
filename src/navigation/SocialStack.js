import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  SocialFeedScreen,
  CreatePostScreen,
  PostDetailScreen,
} from '../screens';
import { colors } from '../theme/colors';

const Stack = createStackNavigator();

const SocialStack = () => {
  return (
    <Stack.Navigator 
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
        name="SocialFeed" 
        component={SocialFeedScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      {/* 
      Future Social Screens:
      - Challenges (workout challenges)
      - Leaderboard (challenge rankings)
      - UserProfile (other users' profiles)
      - MyPosts (user's own posts)
      - ProgressPhotos (progress photo gallery)
      - WorkoutMedia (workout videos/photos)
      */}
    </Stack.Navigator>
  );
};

export default SocialStack; 