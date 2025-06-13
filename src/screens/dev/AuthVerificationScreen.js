import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert 
} from 'react-native';
import { colors } from '../../theme/colors';
import AuthVerificationService from '../../utils/authVerification';
import { useAuth } from '../../context/AuthContext';

const AuthVerificationScreen = ({ navigation }) => {
  const { user, isLoading } = useAuth();
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('TestPassword123!');

  useEffect(() => {
    // Run quick health check on mount if user is authenticated
    if (user && !isLoading) {
      runQuickHealthCheck();
    }
  }, [user, isLoading]);

  const runQuickHealthCheck = async () => {
    try {
      setIsRunningTests(true);
      const result = await AuthVerificationService.quickHealthCheck();
      console.log('Quick health check result:', result);
    } catch (error) {
      console.error('Health check error:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const runFullVerification = async () => {
    try {
      setIsRunningTests(true);
      setTestResults(null);
      
      const results = await AuthVerificationService.verifyUserSetup();
      setTestResults(results);
      
    } catch (error) {
      Alert.alert('Verification Error', error.message);
    } finally {
      setIsRunningTests(false);
    }
  };

  const testSignupFlow = async () => {
    if (!testEmail || !testPassword) {
      Alert.alert('Error', 'Please enter test email and password');
      return;
    }

    try {
      setIsRunningTests(true);
      
      const result = await AuthVerificationService.testCompleteSignupFlow(
        testEmail, 
        testPassword
      );
      
      if (result) {
        Alert.alert('Success', 'Signup flow test completed successfully');
      } else {
        Alert.alert('Failed', 'Signup flow test failed - check console for details');
      }
      
    } catch (error) {
      Alert.alert('Test Error', error.message);
    } finally {
      setIsRunningTests(false);
    }
  };

  const renderTestResult = (name, result) => {
    const getIcon = () => {
      if (result === true) return '✅';
      if (result === false) return '❌';
      return '⚠️';
    };

    const getStatus = () => {
      if (result === true) return 'PASS';
      if (result === false) return 'FAIL';
      return 'SKIP';
    };

    const getColor = () => {
      if (result === true) return colors.success || '#22c55e';
      if (result === false) return colors.error || '#ef4444';
      return colors.warning || '#f59e0b';
    };

    return (
      <View key={name} style={styles.testResultRow}>
        <Text style={styles.testIcon}>{getIcon()}</Text>
        <Text style={styles.testName}>{name}</Text>
        <Text style={[styles.testStatus, { color: getColor() }]}>
          {getStatus()}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔐 Auth Verification</Text>
        <Text style={styles.subtitle}>
          Verify user setup with Supabase auth and profiles
        </Text>
      </View>

      {/* Current User Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current User Status</Text>
        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.userText}>✅ Authenticated</Text>
            <Text style={styles.userDetail}>Email: {user.email}</Text>
            <Text style={styles.userDetail}>ID: {user.id}</Text>
          </View>
        ) : (
          <Text style={styles.userText}>❌ Not authenticated</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runQuickHealthCheck}
          disabled={isRunningTests || !user}
        >
          <Text style={styles.buttonText}>
            {isRunningTests ? '🔄 Running...' : '🏥 Quick Health Check'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={runFullVerification}
          disabled={isRunningTests}
        >
          <Text style={styles.buttonText}>
            {isRunningTests ? '🔄 Running...' : '🔍 Full Verification'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Test Signup Flow */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Signup Flow</Text>
        <Text style={styles.sectionSubtitle}>
          ⚠️ Use a test email - this will create a real user
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Test Email"
          value={testEmail}
          onChangeText={setTestEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Test Password"
          value={testPassword}
          onChangeText={setTestPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, styles.warningButton]} 
          onPress={testSignupFlow}
          disabled={isRunningTests}
        >
          <Text style={styles.buttonText}>
            {isRunningTests ? '🔄 Testing...' : '🧪 Test Signup Flow'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      {testResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Results</Text>
          
          <View style={styles.resultsContainer}>
            {renderTestResult('Database Trigger', testResults.databaseTriggerTest)}
            {renderTestResult('Manual Profile Creation', testResults.manualProfileCreationTest)}
            {renderTestResult('Profile Linkage', testResults.profileLinkageTest)}
            {renderTestResult('Training Stats', testResults.trainingStatsTest)}
            {renderTestResult('Cascade Deletion', testResults.cascadeDeletionTest)}
          </View>
          
          <View style={styles.overallResult}>
            <Text style={[
              styles.overallText,
              { color: testResults.overall ? '#22c55e' : '#f59e0b' }
            ]}>
              {testResults.overall ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}
            </Text>
          </View>

          {!testResults.overall && (
            <View style={styles.recommendations}>
              <Text style={styles.recommendationTitle}>💡 Recommendations:</Text>
              {testResults.databaseTriggerTest === false && (
                <Text style={styles.recommendation}>
                  • Set up database trigger for automatic profile creation
                </Text>
              )}
              {testResults.manualProfileCreationTest === false && (
                <Text style={styles.recommendation}>
                  • Fix manual profile creation in AuthService
                </Text>
              )}
              {testResults.profileLinkageTest === false && (
                <Text style={styles.recommendation}>
                  • Check profile creation logic and foreign key constraints
                </Text>
              )}
              {testResults.trainingStatsTest === false && (
                <Text style={styles.recommendation}>
                  • Ensure training stats are created for new users
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            • Database triggers automatically create profiles when users sign up
          </Text>
          <Text style={styles.infoText}>
            • Manual profile creation serves as a fallback
          </Text>
          <Text style={styles.infoText}>
            • Training stats are created alongside profiles
          </Text>
          <Text style={styles.infoText}>
            • Cascade deletion ensures data cleanup
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Check console for detailed logs</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary || '#4f46e5',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white || '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white || '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.white || '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text || '#1f2937',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary || '#6b7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  userInfo: {
    padding: 12,
    backgroundColor: colors.backgroundSecondary || '#f1f5f9',
    borderRadius: 8,
  },
  userText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text || '#1f2937',
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: colors.textSecondary || '#6b7280',
    marginBottom: 2,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary || '#4f46e5',
  },
  secondaryButton: {
    backgroundColor: colors.secondary || '#6366f1',
  },
  warningButton: {
    backgroundColor: colors.warning || '#f59e0b',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white || '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border || '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: colors.white || '#ffffff',
  },
  resultsContainer: {
    backgroundColor: colors.backgroundSecondary || '#f8fafc',
    borderRadius: 8,
    padding: 16,
  },
  testResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#e5e7eb',
  },
  testIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  testName: {
    flex: 1,
    fontSize: 16,
    color: colors.text || '#1f2937',
  },
  testStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  overallResult: {
    marginTop: 16,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundSecondary || '#f8fafc',
    borderRadius: 8,
  },
  overallText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendations: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  recommendation: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 4,
  },
  infoContainer: {
    padding: 12,
    backgroundColor: colors.backgroundSecondary || '#f1f5f9',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary || '#6b7280',
    marginBottom: 6,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary || '#9ca3af',
    fontStyle: 'italic',
  },
});

export default AuthVerificationScreen; 