import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Switch,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useProfile } from '../../hooks/useProfile';

const { width, height } = Dimensions.get('window');

const NotificationsScreen = ({ navigation }) => {
  const {
    profile,
    loading,
    updating,
    updateProfile,
  } = useProfile();

  const [settings, setSettings] = useState({
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: true,
    training_reminders: true,
    workout_reminders: true,
    progress_updates: true,
    social_notifications: true,
    achievement_notifications: true,
    weekly_summary: true,
    marketing_emails: false,
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (profile) {
      setSettings({
        notifications_enabled: profile.notifications_enabled ?? true,
        email_notifications: profile.email_notifications ?? true,
        push_notifications: profile.push_notifications ?? true,
        training_reminders: profile.training_reminders ?? true,
        workout_reminders: profile.workout_reminders ?? true,
        progress_updates: profile.progress_updates ?? true,
        social_notifications: profile.social_notifications ?? true,
        achievement_notifications: profile.achievement_notifications ?? true,
        weekly_summary: profile.weekly_summary ?? true,
        marketing_emails: profile.marketing_emails ?? false,
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

  const handleToggleNotification = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      const result = await updateProfile(newSettings);
      if (!result.success) {
        // Revert on failure
        setSettings(settings);
        Alert.alert('Error', result.error || 'Failed to update notification settings');
      }
    } catch (error) {
      // Revert on failure
      setSettings(settings);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const NotificationSection = ({ title, description, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description && <Text style={styles.sectionDescription}>{description}</Text>}
      {children}
    </View>
  );

  const NotificationToggle = ({ label, description, value, onToggle, disabled = false }) => (
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
        <Text style={styles.loadingText}>Loading notification settings...</Text>
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
            <Text style={styles.title}>Notifications</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Master Toggle */}
          <NotificationSection
            title="Master Control"
            description="Turn all notifications on or off"
          >
            <NotificationToggle
              label="Enable Notifications"
              description="Master switch for all app notifications"
              value={settings.notifications_enabled}
              onToggle={(value) => handleToggleNotification('notifications_enabled', value)}
            />
          </NotificationSection>

          {/* Push Notifications */}
          <NotificationSection
            title="Push Notifications"
            description="Notifications sent directly to your device"
          >
            <NotificationToggle
              label="Push Notifications"
              description="Receive notifications on your device"
              value={settings.push_notifications}
              onToggle={(value) => handleToggleNotification('push_notifications', value)}
              disabled={!settings.notifications_enabled}
            />
            
            <NotificationToggle
              label="Training Reminders"
              description="Reminders for scheduled workout sessions"
              value={settings.training_reminders}
              onToggle={(value) => handleToggleNotification('training_reminders', value)}
              disabled={!settings.notifications_enabled || !settings.push_notifications}
            />

            <NotificationToggle
              label="Workout Reminders"
              description="Daily reminders to stay active"
              value={settings.workout_reminders}
              onToggle={(value) => handleToggleNotification('workout_reminders', value)}
              disabled={!settings.notifications_enabled || !settings.push_notifications}
            />

            <NotificationToggle
              label="Achievement Notifications"
              description="Celebrate your fitness milestones"
              value={settings.achievement_notifications}
              onToggle={(value) => handleToggleNotification('achievement_notifications', value)}
              disabled={!settings.notifications_enabled || !settings.push_notifications}
            />

            <NotificationToggle
              label="Social Notifications"
              description="Likes, comments, and follows"
              value={settings.social_notifications}
              onToggle={(value) => handleToggleNotification('social_notifications', value)}
              disabled={!settings.notifications_enabled || !settings.push_notifications}
            />
          </NotificationSection>

          {/* Email Notifications */}
          <NotificationSection
            title="Email Notifications"
            description="Notifications sent to your email address"
          >
            <NotificationToggle
              label="Email Notifications"
              description="Receive notifications via email"
              value={settings.email_notifications}
              onToggle={(value) => handleToggleNotification('email_notifications', value)}
              disabled={!settings.notifications_enabled}
            />

            <NotificationToggle
              label="Progress Updates"
              description="Weekly progress summaries"
              value={settings.progress_updates}
              onToggle={(value) => handleToggleNotification('progress_updates', value)}
              disabled={!settings.notifications_enabled || !settings.email_notifications}
            />

            <NotificationToggle
              label="Weekly Summary"
              description="Your weekly fitness achievements"
              value={settings.weekly_summary}
              onToggle={(value) => handleToggleNotification('weekly_summary', value)}
              disabled={!settings.notifications_enabled || !settings.email_notifications}
            />

            <NotificationToggle
              label="Marketing Emails"
              description="Tips, challenges, and app updates"
              value={settings.marketing_emails}
              onToggle={(value) => handleToggleNotification('marketing_emails', value)}
              disabled={!settings.notifications_enabled || !settings.email_notifications}
            />
          </NotificationSection>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>📱 Need Help?</Text>
            <Text style={styles.infoText}>
              If you're not receiving notifications, check your device settings to ensure 
              notifications are enabled for the Medeiros Method app.
            </Text>
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
  },
});

export default NotificationsScreen; 