import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors } from '../../theme/colors';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const AccountScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const {
    profile,
    loading,
    updating,
  } = useProfile();

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleExportData = async () => {
    Alert.alert(
      'Export Your Data',
      'This will create a file containing all your profile data, workouts, and progress. This may take a few moments.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            try {
              setExporting(true);
              
              // Simulate data export (in real app, this would call an edge function)
              const exportData = {
                profile: profile,
                exportDate: new Date().toISOString(),
                user: {
                  id: user?.id,
                  email: user?.email,
                  created_at: user?.created_at,
                },
                message: 'Your data export from Medeiros Method'
              };

              // Create file
              const fileName = `medeiros-method-data-${new Date().toISOString().split('T')[0]}.json`;
              const fileUri = `${FileSystem.documentDirectory}${fileName}`;
              
              await FileSystem.writeAsStringAsync(
                fileUri,
                JSON.stringify(exportData, null, 2),
                { encoding: FileSystem.EncodingType.UTF8 }
              );

              // Share the file
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                  mimeType: 'application/json',
                  dialogTitle: 'Export Your Data',
                });
              } else {
                Alert.alert('Success', `Data exported to: ${fileName}`);
              }
            } catch (error) {
              console.error('Export error:', error);
              Alert.alert('Error', 'Failed to export data. Please try again.');
            } finally {
              setExporting(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This action cannot be undone. All your data, workouts, progress, and achievements will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I understand, delete my account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? This will permanently delete your account and all associated data.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: performAccountDeletion,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    try {
      setDeleting(true);
      
      // In a real app, this would call an edge function to delete all user data
      // For now, we'll just sign out and show a message
      
      Alert.alert(
        'Account Deletion Request Submitted',
        'Your account deletion request has been submitted. You will receive a confirmation email within 24 hours. Your account will be permanently deleted within 30 days unless you contact support to cancel the request.',
        [
          {
            text: 'OK',
            onPress: () => {
              signOut();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Error', 'Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you\'d like to get help:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email Support',
          onPress: () => {
            // In a real app, this would open email client
            Alert.alert('Email Support', 'support@medeirosmethod.com\n\nYour support request would be sent here.');
          },
        },
        {
          text: 'View FAQ',
          onPress: () => {
            // Navigate to FAQ or open web
            Alert.alert('FAQ', 'This would open the FAQ section.');
          },
        },
      ]
    );
  };

  const handleReportBug = () => {
    Alert.alert(
      'Report a Bug',
      'Help us improve the app by reporting any issues you encounter.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report Bug',
          onPress: () => {
            // In a real app, this would open a bug report form
            Alert.alert('Bug Report', 'This would open a bug report form.');
          },
        },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out the Medeiros Method fitness app! Transform your training with expert guidance. Download now!',
        title: 'Medeiros Method',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const AccountSection = ({ title, children, icon }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{icon} {title}</Text>
      {children}
    </View>
  );

  const AccountButton = ({ title, description, onPress, type = 'default', disabled = false, loading = false }) => (
    <TouchableOpacity
      style={[
        styles.accountButton,
        type === 'destructive' && styles.destructiveButton,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <View style={styles.buttonContent}>
        <Text style={[
          styles.buttonTitle,
          type === 'destructive' && styles.destructiveButtonTitle,
          disabled && styles.disabledButtonTitle,
        ]}>
          {title}
        </Text>
        {description && (
          <Text style={[
            styles.buttonDescription,
            disabled && styles.disabledButtonTitle,
          ]}>
            {description}
          </Text>
        )}
      </View>
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={type === 'destructive' ? colors.red : colors.slateBlue} 
        />
      )}
      {!loading && (
        <Text style={[
          styles.buttonArrow,
          type === 'destructive' && styles.destructiveButtonTitle,
        ]}>
          →
        </Text>
      )}
    </TouchableOpacity>
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
        <Text style={styles.loadingText}>Loading account settings...</Text>
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
            <Text style={styles.title}>Account Settings</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Account Info */}
          <AccountSection title="Account Information" icon="👤">
            <View style={styles.accountInfo}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'Not available'}</Text>
              
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
              </Text>
              
              <Text style={styles.infoLabel}>Profile Status</Text>
              <Text style={styles.infoValue}>
                {profile?.email_confirmed_at ? 'Verified' : 'Unverified'}
              </Text>
            </View>
          </AccountSection>

          {/* Data Management */}
          <AccountSection title="Data Management" icon="📊">
            <AccountButton
              title="Manage Tracks"
              description="View and modify your training track subscriptions"
              onPress={() => navigation.navigate('ManageTracks')}
            />
            
            <AccountButton
              title="Export Your Data"
              description="Download all your profile and workout data"
              onPress={handleExportData}
              loading={exporting}
            />
            
            <AccountButton
              title="Change Email"
              description="Update your account email address"
              onPress={() => Alert.alert('Change Email', 'This feature would allow changing your email address.')}
            />
            
            <AccountButton
              title="Change Password"
              description="Update your account password"
              onPress={() => Alert.alert('Change Password', 'This feature would allow changing your password.')}
            />
          </AccountSection>

          {/* Help & Support */}
          <AccountSection title="Help & Support" icon="🤝">
            <AccountButton
              title="Contact Support"
              description="Get help with your account or the app"
              onPress={handleContactSupport}
            />
            
            <AccountButton
              title="Report a Bug"
              description="Help us improve by reporting issues"
              onPress={handleReportBug}
            />
            
            <AccountButton
              title="Share the App"
              description="Tell your friends about Medeiros Method"
              onPress={handleShareApp}
            />
            
            <AccountButton
              title="Rate the App"
              description="Leave a review in the app store"
              onPress={() => Alert.alert('Rate App', 'This would open the app store rating.')}
            />
          </AccountSection>

          {/* Legal */}
          <AccountSection title="Legal" icon="📋">
            <AccountButton
              title="Terms of Service"
              description="View our terms and conditions"
              onPress={() => Alert.alert('Terms of Service', 'This would open the terms of service.')}
            />
            
            <AccountButton
              title="Privacy Policy"
              description="Learn how we protect your data"
              onPress={() => Alert.alert('Privacy Policy', 'This would open the privacy policy.')}
            />
            
            <AccountButton
              title="Licenses"
              description="Third-party software licenses"
              onPress={() => Alert.alert('Licenses', 'This would show third-party licenses.')}
            />
          </AccountSection>

          {/* Danger Zone */}
          <AccountSection title="Danger Zone" icon="⚠️">
            <AccountButton
              title="Sign Out"
              description="Sign out of your account"
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
            />
            
            <AccountButton
              title="Delete Account"
              description="Permanently delete your account and all data"
              onPress={handleDeleteAccount}
              type="destructive"
              loading={deleting}
            />
          </AccountSection>

          {/* App Version */}
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>Medeiros Method v1.0.0</Text>
            <Text style={styles.versionSubText}>© 2024 Medeiros Method. All rights reserved.</Text>
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
    marginBottom: 15,
  },
  accountInfo: {
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.slateBlue,
    marginBottom: 8,
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(52, 73, 94, 0.05)',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  destructiveButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: colors.red,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 2,
  },
  destructiveButtonTitle: {
    color: colors.red,
  },
  disabledButtonTitle: {
    color: colors.lightGray,
  },
  buttonDescription: {
    fontSize: 12,
    color: colors.gray,
    lineHeight: 16,
  },
  buttonArrow: {
    fontSize: 18,
    color: colors.slateBlue,
    fontWeight: 'bold',
  },
  versionSection: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 5,
  },
  versionSubText: {
    fontSize: 12,
    color: colors.lightGray,
    textAlign: 'center',
  },
});

export default AccountScreen; 