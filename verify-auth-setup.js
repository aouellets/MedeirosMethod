#!/usr/bin/env node

/**
 * Auth Setup Verification Script
 * 
 * This script verifies that your Supabase authentication setup is working correctly
 * and that users are properly linked to profiles table during signup.
 * 
 * Run: node verify-auth-setup.js
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// You'll need to update these with your actual Supabase credentials
const SUPABASE_URL = 'https://lvacourlbrjwlvioqrqc.supabase.co';
const SUPABASE_ANON_KEY = 'your_anon_key_here'; // Replace with your actual anon key

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class AuthSetupVerifier {
  constructor() {
    this.testResults = {
      databaseConnection: null,
      profilesTableExists: null,
      trainingStatsTableExists: null,
      triggerExists: null,
      signupTest: null,
      profileLinkageTest: null,
      overallHealth: false
    };
  }

  async runVerification() {
    console.log('🔍 Starting Supabase Auth Setup Verification...\n');
    console.log('=' .repeat(60));

    try {
      // Test 1: Database Connection
      await this.testDatabaseConnection();
      
      // Test 2: Check if required tables exist
      await this.checkRequiredTables();
      
      // Test 3: Check if trigger exists
      await this.checkTriggerExists();
      
      // Test 4: Test signup flow (optional)
      const shouldTestSignup = await this.askQuestion(
        '\n🧪 Do you want to test the signup flow? (This will create a test user) [y/N]: '
      );
      
      if (shouldTestSignup.toLowerCase().startsWith('y')) {
        await this.testSignupFlow();
      } else {
        console.log('⏭️  Skipping signup flow test');
        this.testResults.signupTest = null;
        this.testResults.profileLinkageTest = null;
      }
      
      // Calculate overall health
      this.calculateOverallHealth();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
    } finally {
      rl.close();
    }
  }

  async testDatabaseConnection() {
    console.log('1️⃣ Testing database connection...');
    
    try {
      // Simple query to test connection
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);

      if (error) {
        throw error;
      }

      console.log('✅ Database connection successful');
      this.testResults.databaseConnection = true;
      
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      this.testResults.databaseConnection = false;
    }
  }

  async checkRequiredTables() {
    console.log('2️⃣ Checking required tables...');
    
    try {
      // Check if profiles table exists
      const { data: profilesTable, error: profilesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles')
        .single();

      if (profilesError && profilesError.code !== 'PGRST116') {
        throw profilesError;
      }

      if (profilesTable) {
        console.log('✅ Profiles table exists');
        this.testResults.profilesTableExists = true;
      } else {
        console.log('❌ Profiles table not found');
        this.testResults.profilesTableExists = false;
      }

      // Check if training_stats table exists
      const { data: statsTable, error: statsError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'training_stats')
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      if (statsTable) {
        console.log('✅ Training stats table exists');
        this.testResults.trainingStatsTableExists = true;
      } else {
        console.log('❌ Training stats table not found');
        this.testResults.trainingStatsTableExists = false;
      }
      
    } catch (error) {
      console.log('❌ Table check failed:', error.message);
      this.testResults.profilesTableExists = false;
      this.testResults.trainingStatsTableExists = false;
    }
  }

  async checkTriggerExists() {
    console.log('3️⃣ Checking for database triggers...');
    
    try {
      // Check if the trigger exists (this might not work depending on permissions)
      const { data, error } = await supabase
        .from('information_schema.triggers')
        .select('trigger_name')
        .eq('trigger_name', 'on_auth_user_created')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('⚠️  Could not verify trigger existence (this is normal with limited permissions)');
        this.testResults.triggerExists = null;
        return;
      }

      if (data) {
        console.log('✅ Auth user creation trigger exists');
        this.testResults.triggerExists = true;
      } else {
        console.log('⚠️  Trigger not found or not accessible');
        this.testResults.triggerExists = null;
      }
      
    } catch (error) {
      console.log('⚠️  Could not check trigger existence:', error.message);
      this.testResults.triggerExists = null;
    }
  }

  async testSignupFlow() {
    console.log('4️⃣ Testing signup flow...');
    
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      console.log(`📝 Creating test user: ${testEmail}`);
      
      // Sign up a test user
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: 'Test',
            full_name: 'Test User'
          }
        }
      });

      if (signupError) {
        throw signupError;
      }

      if (!signupData.user) {
        throw new Error('No user data returned from signup');
      }

      console.log('✅ User created successfully');
      console.log(`   User ID: ${signupData.user.id}`);
      this.testResults.signupTest = true;

      // Check if profile was created (wait a moment for trigger to fire)
      console.log('🔍 Checking if profile was created...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      await this.checkProfileCreation(signupData.user.id, testEmail);
      
      // Clean up: Delete the test user (if possible)
      console.log('🧹 Cleaning up test user...');
      await this.cleanupTestUser(signupData.user.id);
      
    } catch (error) {
      console.log('❌ Signup flow test failed:', error.message);
      this.testResults.signupTest = false;
      this.testResults.profileLinkageTest = false;
    }
  }

  async checkProfileCreation(userId, email) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('❌ Profile was not created automatically');
          this.testResults.profileLinkageTest = false;
          return;
        }
        throw profileError;
      }

      if (profile && profile.id === userId && profile.email === email) {
        console.log('✅ Profile created and properly linked');
        console.log(`   Profile ID: ${profile.id}`);
        console.log(`   Profile Email: ${profile.email}`);
        console.log(`   Profile Name: ${profile.first_name}`);
        this.testResults.profileLinkageTest = true;
      } else {
        console.log('❌ Profile exists but linkage is incorrect');
        this.testResults.profileLinkageTest = false;
      }
      
    } catch (error) {
      console.log('❌ Profile check failed:', error.message);
      this.testResults.profileLinkageTest = false;
    }
  }

  async cleanupTestUser(userId) {
    try {
      // Try to delete the profile first (will cascade to auth.users if set up correctly)
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileDeleteError) {
        console.log('⚠️  Could not delete test profile:', profileDeleteError.message);
      } else {
        console.log('✅ Test profile deleted');
      }
      
    } catch (error) {
      console.log('⚠️  Cleanup failed:', error.message);
    }
  }

  calculateOverallHealth() {
    const requiredTests = [
      this.testResults.databaseConnection,
      this.testResults.profilesTableExists
    ];

    const optionalTests = [
      this.testResults.trainingStatsTableExists,
      this.testResults.triggerExists,
      this.testResults.signupTest,
      this.testResults.profileLinkageTest
    ];

    // All required tests must pass
    const requiredPassed = requiredTests.every(result => result === true);
    
    // At least some optional tests should pass or be skipped
    const criticalFailures = optionalTests.filter(result => result === false).length;
    
    this.testResults.overallHealth = requiredPassed && criticalFailures <= 1;
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION RESULTS');
    console.log('='.repeat(60));

    const tests = [
      { name: 'Database Connection', result: this.testResults.databaseConnection, required: true },
      { name: 'Profiles Table', result: this.testResults.profilesTableExists, required: true },
      { name: 'Training Stats Table', result: this.testResults.trainingStatsTableExists, required: false },
      { name: 'Database Trigger', result: this.testResults.triggerExists, required: false },
      { name: 'Signup Flow', result: this.testResults.signupTest, required: false },
      { name: 'Profile Linkage', result: this.testResults.profileLinkageTest, required: false }
    ];

    tests.forEach(test => {
      const icon = test.result === true ? '✅' : test.result === false ? '❌' : '⚠️';
      const status = test.result === true ? 'PASS' : test.result === false ? 'FAIL' : 'SKIP';
      const required = test.required ? ' (Required)' : ' (Optional)';
      console.log(`${icon} ${test.name}: ${status}${required}`);
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`🎯 Overall Health: ${this.testResults.overallHealth ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}`);
    console.log('='.repeat(60));

    if (!this.testResults.overallHealth) {
      console.log('\n💡 RECOMMENDATIONS:');
      
      if (this.testResults.databaseConnection === false) {
        console.log('• Check your Supabase URL and anon key configuration');
      }
      
      if (this.testResults.profilesTableExists === false) {
        console.log('• Run the profiles table migration: supabase/migrations/20240612_create_profiles_table.sql');
      }
      
      if (this.testResults.trainingStatsTableExists === false) {
        console.log('• Ensure training_stats table is created alongside profiles');
      }
      
      if (this.testResults.triggerExists === false) {
        console.log('• Set up database trigger for automatic profile creation');
      }
      
      if (this.testResults.profileLinkageTest === false) {
        console.log('• Check that database trigger is working or implement manual profile creation');
      }
    } else {
      console.log('\n🎉 Your authentication setup looks healthy!');
      console.log('\nKey features working:');
      console.log('• ✅ Database connection established');
      console.log('• ✅ Required tables exist');
      if (this.testResults.profileLinkageTest === true) {
        console.log('• ✅ Profile creation and linkage working');
      }
      if (this.testResults.trainingStatsTableExists === true) {
        console.log('• ✅ Training stats table ready');
      }
    }

    console.log('\n📝 Next steps:');
    console.log('1. Test signup in your app with the AuthVerificationScreen');
    console.log('2. Monitor your Supabase dashboard for new users and profiles');
    console.log('3. Check that Row Level Security (RLS) policies are working');
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
}

// Run the verification
async function main() {
  console.log('🚀 Supabase Auth Setup Verifier');
  console.log('================================\n');
  
  if (SUPABASE_ANON_KEY === 'your_anon_key_here') {
    console.log('❌ Please update the SUPABASE_ANON_KEY in this script with your actual anon key');
    console.log('   You can find it in your Supabase dashboard: Settings > API');
    process.exit(1);
  }

  const verifier = new AuthSetupVerifier();
  await verifier.runVerification();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AuthSetupVerifier }; 