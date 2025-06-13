import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { signOut, user } = useAuth();
  const { 
    profile, 
    trainingStats, 
    loading, 
    error, 
    refreshProfile 
  } = useProfile();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const StatCard = ({ title, value, subtitle }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value || '0'}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const MenuOption = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Text style={styles.menuIconText}>{icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && <Text style={styles.menuArrow}>›</Text>}
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <ActivityIndicator size="large" color={colors.white} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <Text style={styles.errorText}>⚠️ Failed to load profile</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshProfile}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeContainer}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <Image source={require('../../assets/logo_transparent.png')} style={styles.avatar} />
              )}
            </View>
            <Text style={styles.welcomeText}>
              Welcome back, {profile?.first_name || user?.user_metadata?.first_name || 'Athlete'}!
            </Text>
            <Text style={styles.emailText}>{profile?.email || user?.email}</Text>
            {profile?.bio && <Text style={styles.bioText}>{profile.bio}</Text>}
          </View>

          {/* Training Stats */}
          <View style={styles.statsContainer}>
            <StatCard 
              title="Training Days" 
              value={trainingStats?.total_training_days} 
              subtitle="All time"
            />
            <StatCard 
              title="Workouts Completed" 
              value={trainingStats?.total_workouts} 
              subtitle="Total sessions"
            />
            <StatCard 
              title="Current Streak" 
              value={`${trainingStats?.current_streak || 0} days`} 
              subtitle="Keep it up!"
            />
          </View>

          {/* Fitness Level & Goals */}
          <View style={styles.fitnessInfo}>
            <Text style={styles.fitnessLevel}>
              {profile?.fitness_level?.charAt(0).toUpperCase() + profile?.fitness_level?.slice(1) || 'Beginner'} Level
            </Text>
            {profile?.location && (
              <Text style={styles.location}>📍 {profile.location}</Text>
            )}
          </View>

          {/* Profile Options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Settings & Privacy</Text>
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>✏️</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Edit Profile</Text>
                <Text style={styles.optionDescription}>Update your personal information</Text>
              </View>
              <Text style={styles.optionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => navigation.navigate('Notifications')}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>🔔</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Notifications</Text>
                <Text style={styles.optionDescription}>Manage your notification preferences</Text>
              </View>
              <Text style={styles.optionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => navigation.navigate('Privacy')}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>🔒</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Privacy & Data</Text>
                <Text style={styles.optionDescription}>Control your privacy settings</Text>
              </View>
              <Text style={styles.optionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => navigation.navigate('Account')}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>⚙️</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Account Settings</Text>
                <Text style={styles.optionDescription}>Manage your account and data</Text>
              </View>
              <Text style={styles.optionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => Alert.alert('Help & Support', 'Contact support or view FAQ')}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>🤝</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Help & Support</Text>
                <Text style={styles.optionDescription}>Get help or report issues</Text>
              </View>
              <Text style={styles.optionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionItem, styles.signOutOption]}
              onPress={() => {
                Alert.alert(
                  'Sign Out',
                  'Are you sure you want to sign out?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign Out', onPress: signOut },
                  ]
                );
              }}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>🚪</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionText, styles.signOutText]}>Sign Out</Text>
                <Text style={[styles.optionDescription, styles.signOutText]}>Sign out of your account</Text>
              </View>
              <Text style={[styles.optionArrow, styles.signOutText]}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Earned Every Day</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slateBlue,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.1,
    right: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: colors.burntOrange,
    opacity: 0.1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.2,
    left: -width * 0.4,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: colors.white,
    opacity: 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.slateBlue,
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.slateBlue,
    padding: 20,
  },
  errorText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingTop: 80,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.burntOrange,
    marginBottom: 15,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: colors.lightGray,
    textAlign: 'center',
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    color: colors.lightGray,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.burntOrange,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: colors.lightGray,
    textAlign: 'center',
  },
  fitnessInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  fitnessLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.burntOrange,
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: colors.lightGray,
  },
  optionsContainer: {
    gap: 12,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(230, 126, 34, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionIconText: {
    fontSize: 18,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.lightGray,
  },
  optionArrow: {
    fontSize: 20,
    color: colors.lightGray,
    fontWeight: '300',
  },
  signOutOption: {
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  signOutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    textShadowColor: colors.burntOrange,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default ProfileScreen; 