import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TrainingStack from './TrainingStack';
import CommerceStack from './CommerceStack';
import SocialStack from './SocialStack';
import ProfileStack from './ProfileStack';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, color, size, focused }) => {
  return (
    <View style={styles.iconContainer}>
      <LinearGradient
        colors={focused ? [colors.burntOrange, colors.burntOrange] : ['transparent', 'transparent']}
        style={styles.iconGradient}
      >
        <MaterialCommunityIcons 
          name={name} 
          size={size} 
          color={focused ? colors.white : color}
          style={styles.icon}
        />
      </LinearGradient>
    </View>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Training"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.burntOrange,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen 
        name="Training" 
        component={TrainingStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="dumbbell" color={color} size={size} focused={focused} />
          ),
          tabBarLabel: 'Training',
        }}
      />
      <Tab.Screen 
        name="Store" 
        component={CommerceStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="shopping" color={color} size={size} focused={focused} />
          ),
          tabBarLabel: 'Store',
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={SocialStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="account-group" color={color} size={size} focused={focused} />
          ),
          tabBarLabel: 'Community',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="account" color={color} size={size} focused={focused} />
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.boneWhite,
    borderTopColor: colors.lightGray,
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 10,
    paddingTop: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    lineHeight: 24,
  },
});

export default MainTabNavigator; 