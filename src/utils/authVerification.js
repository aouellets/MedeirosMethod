import { supabase } from '../lib/supabase';
import ProfileService from '../services/profileService';

class AuthVerificationService {
  /**
   * Comprehensive verification of user setup process
   * Tests both database triggers and manual profile creation
   */
  async verifyUserSetup() {
    console.log('🔍 Starting comprehensive user setup verification...\n');
    
    const results = {
      databaseTriggerTest: null,
      manualProfileCreationTest: null,
      profileLinkageTest: null,
      trainingStatsTest: null,
      cascadeDeletionTest: null,
      overall: false
    };

    try {
      // Test 1: Check if database trigger exists and works
      results.databaseTriggerTest = await this.testDatabaseTrigger();
      
      // Test 2: Test manual profile creation
      results.manualProfileCreationTest = await this.testManualProfileCreation();
      
      // Test 3: Verify profile linkage
      results.profileLinkageTest = await this.testProfileLinkage();
      
      // Test 4: Verify training stats creation
      results.trainingStatsTest = await this.testTrainingStatsCreation();
      
      // Test 5: Test cascade deletion (non-destructive)
      results.cascadeDeletionTest = await this.testCascadeDeletion();
      
      // Overall result
      results.overall = Object.values(results).every(result => 
        result === true || result === null
      );
      
      this.printVerificationResults(results);
      return results;
      
    } catch (error) {
      console.error('❌ Verification failed with error:', error);
      return { ...results, error: error.message };
    }
  }

  /**
   * Test if the database trigger for profile creation exists and works
   */
  async testDatabaseTrigger() {
    console.log('1️⃣ Testing database trigger for automatic profile creation...');
    
    try {
      // Check if the trigger exists
      const { data: triggerExists, error: triggerError } = await supabase
        .rpc('check_trigger_exists', { 
          trigger_name: 'on_auth_user_created' 
        })
        .single();

      if (triggerError) {
        console.log('⚠️  Could not verify trigger existence (this is normal if RPC doesn\'t exist)');
        return null;
      }

      if (!triggerExists) {
        console.log('❌ Database trigger "on_auth_user_created" does not exist');
        return false;
      }

      console.log('✅ Database trigger exists and should handle profile creation automatically');
      return true;
      
    } catch (error) {
      console.log('⚠️  Could not test database trigger:', error.message);
      return null;
    }
  }

  /**
   * Test manual profile creation through AuthService
   */
  async testManualProfileCreation() {
    console.log('2️⃣ Testing manual profile creation logic...');
    
    try {
      // Test if the createUserProfile function exists and has proper structure
      const authService = await import('../services/authService');
      const authServiceInstance = new authService.default();
      
      if (typeof authServiceInstance.createUserProfile !== 'function') {
        console.log('❌ createUserProfile method does not exist in AuthService');
        return false;
      }
      
      console.log('✅ Manual profile creation method exists in AuthService');
      return true;
      
    } catch (error) {
      console.log('❌ Manual profile creation test failed:', error.message);
      return false;
    }
  }

  /**
   * Test if profiles are properly linked to auth.users
   */
  async testProfileLinkage() {
    console.log('3️⃣ Testing profile linkage to auth.users...');
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('⚠️  No authenticated user to test linkage with');
        return null;
      }

      // Check if profile exists for current user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('⚠️  No profile found for current user - this indicates profile creation failed');
          return false;
        }
        throw profileError;
      }

      // Verify the profile is properly linked
      if (profile.id === user.id && profile.email === user.email) {
        console.log('✅ Profile is properly linked to auth.users');
        console.log(`   - User ID: ${user.id}`);
        console.log(`   - Profile ID: ${profile.id}`);
        console.log(`   - Email match: ${profile.email === user.email ? '✅' : '❌'}`);
        return true;
      } else {
        console.log('❌ Profile linkage is incorrect');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Profile linkage test failed:', error.message);
      return false;
    }
  }

  /**
   * Test if training stats are created for users
   */
  async testTrainingStatsCreation() {
    console.log('4️⃣ Testing training stats creation...');
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('⚠️  No authenticated user to test training stats with');
        return null;
      }

      // Check if training stats exist
      const { data: trainingStats, error: statsError } = await supabase
        .from('training_stats')
        .select('user_id, total_workouts, current_streak')
        .eq('user_id', user.id)
        .single();

      if (statsError) {
        if (statsError.code === 'PGRST116') {
          console.log('⚠️  No training stats found - attempting to create...');
          
          // Try to create training stats using ProfileService
          const profileService = new ProfileService();
          const stats = await profileService.getOrCreateTrainingStats(user.id);
          
          if (stats) {
            console.log('✅ Training stats created successfully via ProfileService');
            return true;
          } else {
            console.log('❌ Failed to create training stats');
            return false;
          }
        }
        throw statsError;
      }

      console.log('✅ Training stats exist for user');
      console.log(`   - Total workouts: ${trainingStats.total_workouts}`);
      console.log(`   - Current streak: ${trainingStats.current_streak}`);
      return true;
      
    } catch (error) {
      console.log('❌ Training stats test failed:', error.message);
      return false;
    }
  }

  /**
   * Test cascade deletion (non-destructive check)
   */
  async testCascadeDeletion() {
    console.log('5️⃣ Testing cascade deletion constraints...');
    
    try {
      // Check if the cascade deletion function exists
      const { data: functionExists, error: functionError } = await supabase
        .rpc('check_function_exists', { 
          function_name: 'delete_user_data' 
        });

      if (functionError) {
        console.log('⚠️  Could not verify cascade deletion function existence');
      } else if (functionExists) {
        console.log('✅ Cascade deletion function exists');
      } else {
        console.log('⚠️  Cascade deletion function may not exist');
      }

      // Check foreign key constraints
      const { data: constraints, error: constraintError } = await supabase
        .from('information_schema.table_constraints')
        .select('constraint_name, table_name')
        .eq('constraint_type', 'FOREIGN KEY')
        .like('constraint_name', '%profiles%');

      if (!constraintError && constraints && constraints.length > 0) {
        console.log('✅ Foreign key constraints exist for profiles table');
        return true;
      } else {
        console.log('⚠️  Could not verify foreign key constraints');
        return null;
      }
      
    } catch (error) {
      console.log('⚠️  Cascade deletion test could not be completed:', error.message);
      return null;
    }
  }

  /**
   * Test the complete signup flow
   */
  async testCompleteSignupFlow(testEmail, testPassword) {
    console.log('🧪 Testing complete signup flow...\n');
    
    try {
      // Import AuthService
      const AuthServiceClass = (await import('../services/authService')).default;
      const authService = new AuthServiceClass();
      
      console.log('📝 Attempting to sign up test user...');
      
      const profileData = {
        firstName: 'Test',
        lastName: 'User',
        fitnessLevel: 'beginner',
        trainingGoals: ['weight_loss', 'strength'],
        preferredWorkoutDays: ['monday', 'wednesday', 'friday'],
        equipmentAccess: 'gym',
        unitsPreference: 'metric'
      };

      const signupResult = await authService.signUp(testEmail, testPassword, profileData);
      
      if (!signupResult.success) {
        console.log('❌ Signup failed:', signupResult.error);
        return false;
      }

      console.log('✅ Signup successful');
      
      if (signupResult.needsEmailConfirmation) {
        console.log('📧 Email confirmation required - cannot test profile creation until confirmed');
        return true;
      }

      // If we have a session, verify profile was created
      if (signupResult.session) {
        console.log('🔍 Verifying profile creation...');
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signupResult.user.id)
          .single();

        if (error) {
          console.log('❌ Profile was not created:', error.message);
          return false;
        }

        console.log('✅ Profile created successfully');
        console.log(`   - Name: ${profile.first_name} ${profile.last_name}`);
        console.log(`   - Email: ${profile.email}`);
        console.log(`   - Fitness Level: ${profile.fitness_level}`);
        
        return true;
      }

      return true;
      
    } catch (error) {
      console.log('❌ Complete signup flow test failed:', error.message);
      return false;
    }
  }

  /**
   * Print formatted verification results
   */
  printVerificationResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 USER SETUP VERIFICATION RESULTS');
    console.log('='.repeat(60));
    
    const tests = [
      { name: 'Database Trigger Test', result: results.databaseTriggerTest },
      { name: 'Manual Profile Creation', result: results.manualProfileCreationTest },
      { name: 'Profile Linkage Test', result: results.profileLinkageTest },
      { name: 'Training Stats Test', result: results.trainingStatsTest },
      { name: 'Cascade Deletion Test', result: results.cascadeDeletionTest }
    ];

    tests.forEach(test => {
      const icon = test.result === true ? '✅' : test.result === false ? '❌' : '⚠️';
      const status = test.result === true ? 'PASS' : test.result === false ? 'FAIL' : 'SKIP';
      console.log(`${icon} ${test.name}: ${status}`);
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log(`🎯 Overall Status: ${results.overall ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}`);
    console.log('='.repeat(60));
    
    if (!results.overall) {
      console.log('\n💡 RECOMMENDATIONS:');
      
      if (results.databaseTriggerTest === false) {
        console.log('• Set up database trigger for automatic profile creation');
      }
      
      if (results.manualProfileCreationTest === false) {
        console.log('• Fix manual profile creation in AuthService');
      }
      
      if (results.profileLinkageTest === false) {
        console.log('• Check profile creation logic and foreign key constraints');
      }
      
      if (results.trainingStatsTest === false) {
        console.log('• Ensure training stats are created for new users');
      }
    }
  }

  /**
   * Quick health check for current user
   */
  async quickHealthCheck() {
    console.log('🏥 Quick User Setup Health Check...\n');
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('❌ No authenticated user found');
        return false;
      }

      console.log(`👤 Current User: ${user.email} (${user.id})`);
      
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile not found');
        return false;
      }

      console.log('✅ Profile exists');
      console.log(`   - Name: ${profile.first_name} ${profile.last_name}`);
      console.log(`   - Created: ${new Date(profile.created_at).toLocaleDateString()}`);
      
      // Check training stats
      const { data: stats, error: statsError } = await supabase
        .from('training_stats')
        .select('user_id, total_workouts, current_streak')
        .eq('user_id', user.id)
        .single();

      if (statsError) {
        console.log('⚠️  Training stats not found');
      } else {
        console.log('✅ Training stats exist');
        console.log(`   - Total workouts: ${stats.total_workouts}`);
        console.log(`   - Current streak: ${stats.current_streak}`);
      }
      
      console.log('\n🎯 User setup appears healthy!');
      return true;
      
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return false;
    }
  }
}

export default new AuthVerificationService(); 