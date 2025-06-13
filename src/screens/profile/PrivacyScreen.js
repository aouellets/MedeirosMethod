import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useProfile } from '../../hooks/useProfile';

const { width, height } = Dimensions.get('window');

const PrivacyScreen = ({ navigation }) => {
  const {
    profile,
    loading,
    updating,
    updateProfile,
  } = useProfile();

  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'friends',
    workout_visibility: 'friends',
    progress_visibility: 'private',
    social_sharing: false,
    data_analytics: true,
    location_sharing: false,
    workout_feed_visible: true,
    achievements_visible: true,
    stats_visible: false,
    allow_friend_requests: true,
    show_online_status: false,
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (profile) {
      setPrivacySettings({
        profile_visibility: profile.profile_visibility ?? 'friends',
        workout_visibility: profile.workout_visibility ?? 'friends',
        progress_visibility: profile.progress_visibility ?? 'private',
        social_sharing: profile.social_sharing ?? false,
        data_analytics: profile.data_analytics ?? true,
        location_sharing: profile.location_sharing ?? false,
        workout_feed_visible: profile.workout_feed_visible ?? true,
        achievements_visible: profile.achievements_visible ?? true,
        stats_visible: profile.stats_visible ?? false,
        allow_friend_requests: profile.allow_friend_requests ?? true,
        show_online_status: profile.show_online_status ?? false,
      });
    }
    startAnimations();
  }, [profile]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleUpdatePrivacy = async (key, value) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);

    try {
      const result = await updateProfile(newSettings);
      if (!result.success) {
        // Revert on failure
        setPrivacySettings(privacySettings);
        Alert.alert('Error', result.error || 'Failed to update privacy settings');
      }
    } catch (error) {
      // Revert on failure
      setPrivacySettings(privacySettings);
      Alert.alert('Error', 'Failed to update privacy settings');
    }
  };

  const PrivacySection = ({ title, description, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description && <Text style={styles.sectionDescription}>{description}</Text>}
      {children}
    </View>
  );

  const PrivacyToggle = ({ label, description, value, onToggle, disabled = false }) => (
    <View style={[styles.toggleContainer, disabled && styles.disabledContainer]}>
      <View style={styles.toggleContent}>
        <Text style={[styles.toggleLabel, disabled && styles.disabledText]}>{label}</Text>
        {description && (
          <Text style={[styles.toggleDescription, disabled && styles.disabledText]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled || updating}
        trackColor={{ false: colors.lightGray, true: colors.slateBlue }}
        thumbColor={value ? colors.burntOrange : colors.gray}
        ios_backgroundColor={colors.lightGray}
      />
    </View>
  );

  const VisibilityOption = ({ label, value, currentValue, onSelect, description }) => {
    const isSelected = currentValue === value;
    return (
      <TouchableOpacity
        style={[styles.visibilityOption, isSelected && styles.visibilityOptionSelected]}
        onPress={() => onSelect(value)}
        disabled={updating}
      >
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <View style={styles.optionContent}>
          <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
            {label}
          </Text>
          {description && (
            <Text style={styles.optionDescription}>
              {description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.loadingText}>Loading privacy settings...</Text>
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Privacy & Data</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Profile Visibility */}
          <PrivacySection
            title="🔒 Profile Visibility"
            description="Control who can see your profile information"
          >
            <VisibilityOption
              label="Public"
              value="public"
              currentValue={privacySettings.profile_visibility}
              onSelect={(value) => handleUpdatePrivacy('profile_visibility', value)}
              description="Anyone can see your profile"
            />
            <VisibilityOption
              label="Friends Only"
              value="friends"
              currentValue={privacySettings.profile_visibility}
              onSelect={(value) => handleUpdatePrivacy('profile_visibility', value)}
              description="Only your connections can see your profile"
            />
            <VisibilityOption
              label="Private"
              value="private"
              currentValue={privacySettings.profile_visibility}
              onSelect={(value) => handleUpdatePrivacy('profile_visibility', value)}
              description="Your profile is completely private"
            />
          </PrivacySection>

          {/* Workout Data Visibility */}
          <PrivacySection
            title="💪 Workout Data"
            description="Choose who can see your workout activities"
          >
            <VisibilityOption
              label="Public"
              value="public"
              currentValue={privacySettings.workout_visibility}
              onSelect={(value) => handleUpdatePrivacy('workout_visibility', value)}
              description="Anyone can see your workouts"
            />
            <VisibilityOption
              label="Friends Only"
              value="friends"
              currentValue={privacySettings.workout_visibility}
              onSelect={(value) => handleUpdatePrivacy('workout_visibility', value)}
              description="Only your connections can see your workouts"
            />
            <VisibilityOption
              label="Private"
              value="private"
              currentValue={privacySettings.workout_visibility}
              onSelect={(value) => handleUpdatePrivacy('workout_visibility', value)}
              description="Keep your workouts completely private"
            />
          </PrivacySection>

          {/* Progress Visibility */}
          <PrivacySection
            title="📈 Progress & Stats"
            description="Control visibility of your fitness progress"
          >
            <VisibilityOption
              label="Public"
              value="public"
              currentValue={privacySettings.progress_visibility}
              onSelect={(value) => handleUpdatePrivacy('progress_visibility', value)}
              description="Anyone can see your progress"
            />
            <VisibilityOption
              label="Friends Only"
              value="friends"
              currentValue={privacySettings.progress_visibility}
              onSelect={(value) => handleUpdatePrivacy('progress_visibility', value)}
              description="Only your connections can see your progress"
            />
            <VisibilityOption
              label="Private"
              value="private"
              currentValue={privacySettings.progress_visibility}
              onSelect={(value) => handleUpdatePrivacy('progress_visibility', value)}
              description="Keep your progress data private"
            />
          </PrivacySection>

          {/* Social Features */}
          <PrivacySection
            title="👥 Social Features"
            description="Manage your social interaction preferences"
          >
            <PrivacyToggle
              label="Social Sharing"
              description="Allow sharing of your achievements to social platforms"
              value={privacySettings.social_sharing}
              onToggle={(value) => handleUpdatePrivacy('social_sharing', value)}
            />

            <PrivacyToggle
              label="Workout Feed Visible"
              description="Show your workouts in the community feed"
              value={privacySettings.workout_feed_visible}
              onToggle={(value) => handleUpdatePrivacy('workout_feed_visible', value)}
            />

            <PrivacyToggle
              label="Achievements Visible"
              description="Display your achievements on your profile"
              value={privacySettings.achievements_visible}
              onToggle={(value) => handleUpdatePrivacy('achievements_visible', value)}
            />

            <PrivacyToggle
              label="Statistics Visible"
              description="Show detailed workout statistics"
              value={privacySettings.stats_visible}
              onToggle={(value) => handleUpdatePrivacy('stats_visible', value)}
            />

            <PrivacyToggle
              label="Allow Friend Requests"
              description="Let other users send you friend requests"
              value={privacySettings.allow_friend_requests}
              onToggle={(value) => handleUpdatePrivacy('allow_friend_requests', value)}
            />

            <PrivacyToggle
              label="Show Online Status"
              description="Let others see when you're active"
              value={privacySettings.show_online_status}
              onToggle={(value) => handleUpdatePrivacy('show_online_status', value)}
            />
          </PrivacySection>

          {/* Data & Analytics */}
          <PrivacySection
            title="📊 Data & Analytics"
            description="Control how your data is used for analytics"
          >
            <PrivacyToggle
              label="Anonymous Analytics"
              description="Help improve the app with anonymous usage data"
              value={privacySettings.data_analytics}
              onToggle={(value) => handleUpdatePrivacy('data_analytics', value)}
            />

            <PrivacyToggle
              label="Location Sharing"
              description="Share location data for features like gym finder"
              value={privacySettings.location_sharing}
              onToggle={(value) => handleUpdatePrivacy('location_sharing', value)}
            />
          </PrivacySection>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>🛡️ Your Privacy Matters</Text>
            <Text style={styles.infoText}>
              We respect your privacy and give you full control over your data. 
              You can change these settings at any time. For more information, 
              please read our Privacy Policy.
            </Text>
            
            <TouchableOpacity style={styles.policyButton} onPress={() => {
              // Navigate to privacy policy
              Alert.alert('Privacy Policy', 'This would open the full privacy policy.');
            }}>
              <Text style={styles.policyButtonText}>View Privacy Policy</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slateBlue,
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 15,
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  toggleContent: {
    flex: 1,
    marginRight: 15,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    color: colors.gray,
    lineHeight: 16,
  },
  disabledText: {
    color: colors.lightGray,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(52, 73, 94, 0.05)',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  visibilityOptionSelected: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    borderColor: colors.burntOrange,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.gray,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.burntOrange,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.burntOrange,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: colors.burntOrange,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.gray,
    lineHeight: 16,
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: 15,
  },
  policyButton: {
    backgroundColor: colors.slateBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  policyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PrivacyScreen; 