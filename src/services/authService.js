import { supabase } from '../lib/supabase';

class AuthService {
  /**
   * Sign up a new user with email and password and create profile
   */
  async signUp(email, password, profileData = {}) {
    try {
      // First create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: profileData.first_name || '',
            full_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      // If user was created successfully and we have a session, create the profile
      if (data.user && data.session) {
        try {
          await this.createUserProfile(data.user, profileData);
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't fail the signup if profile creation fails
          // The profile will be created later when they first access the app
        }
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        needsEmailConfirmation: !data.session,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create user profile and training stats (with duplicate handling)
   */
  async createUserProfile(user, profileData) {
    try {
      // First check if profile already exists (created by database trigger)
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        // Profile already exists (created by trigger), just update it with additional data
        console.log('Profile already exists, updating with additional data');
        return await this.updateExistingProfile(user, profileData);
      }

      if (checkError && checkError.code !== 'PGRST116') {
        // Error other than "not found"
        throw checkError;
      }

      // Profile doesn't exist, create it
      return await this.createNewProfile(user, profileData);
    } catch (error) {
      console.error('Create user profile error:', error);
      
      // If it's a duplicate key error, the trigger already created the profile
      if (error.code === '23505') {
        console.log('Profile already created by trigger, updating with additional data');
        return await this.updateExistingProfile(user, profileData);
      }
      
      throw error;
    }
  }

  /**
   * Upload profile photo to Supabase storage
   */
  async uploadProfilePhoto(userId, photoUri) {
    if (!photoUri) return null;

    try {
      // Create FormData for React Native file upload
      const formData = new FormData();
      
      // Extract file extension from URI
      const fileExtension = photoUri.split('.').pop().toLowerCase();
      const fileName = `${userId}_${Date.now()}.${fileExtension}`;
      const filePath = `avatars/${fileName}`;

      // Create file object for React Native
      formData.append('file', {
        uri: photoUri,
        type: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
        name: fileName,
      });

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, formData, {
          contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Profile photo upload error:', error);
      return null; // Don't fail signup if photo upload fails
    }
  }

  /**
   * Create a new profile and training stats
   */
  async createNewProfile(user, profileData) {
    // Helper function to format arrays for PostgreSQL
    const formatArrayForPostgres = (arr) => {
      if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
      return arr;
    };

    // Upload profile photo if provided
    const profilePhotoUrl = await this.uploadProfilePhoto(user.id, profileData.profile_photo);

    // Create profile record
    const profileRecord = {
      id: user.id,
      email: user.email,
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      full_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
      date_of_birth: profileData.date_of_birth || null,
      gender: profileData.gender || null,
      location: profileData.location || '',
      bio: '',
      profile_photo_url: profilePhotoUrl,
      fitness_level: profileData.fitness_level || 'beginner',
      training_goals: formatArrayForPostgres(profileData.training_goals),
      preferred_workout_days: formatArrayForPostgres(profileData.preferred_workout_days),
      preferred_workout_time: profileData.preferred_workout_time || 'morning',
      equipment_access: profileData.equipment_access ? [profileData.equipment_access] : ['gym'],
      injury_history: profileData.injury_history || '',
      units_preference: profileData.units_preference || 'metric',
      notifications_enabled: profileData.notifications_enabled !== false,
      email_notifications: profileData.email_notifications !== false,
      push_notifications: profileData.push_notifications !== false,
      training_reminders: profileData.training_reminders !== false,
      social_sharing: profileData.social_sharing || false,
      privacy_level: 'private',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([profileRecord]);

    if (profileError) {
      throw profileError;
    }

    // Create training stats record
    const trainingStatsRecord = {
      user_id: user.id,
      total_workouts: 0,
      total_training_days: 0,
      current_streak: 0,
      longest_streak: 0,
      total_training_time_minutes: 0,
      last_workout_date: null,
      favorite_workout_type: null,
      pr_records: {},
      monthly_goals: {},
      achievements: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: statsError } = await supabase
      .from('training_stats')
      .insert([trainingStatsRecord]);

    if (statsError) {
      throw statsError;
    }

    return { success: true };
  }

  /**
   * Update existing profile with additional data
   */
  async updateExistingProfile(user, profileData) {
    // Helper function to format arrays for PostgreSQL
    const formatArrayForPostgres = (arr) => {
      if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
      return arr;
    };

    // Upload profile photo if provided
    const profilePhotoUrl = await this.uploadProfilePhoto(user.id, profileData.profile_photo);

    // Update profile with additional data from signup form
    const updateData = {
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      full_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
      date_of_birth: profileData.date_of_birth || null,
      gender: profileData.gender || null,
      location: profileData.location || '',
      fitness_level: profileData.fitness_level || 'beginner',
      training_goals: formatArrayForPostgres(profileData.training_goals),
      preferred_workout_days: formatArrayForPostgres(profileData.preferred_workout_days),
      preferred_workout_time: profileData.preferred_workout_time || 'morning',
      equipment_access: profileData.equipment_access ? [profileData.equipment_access] : ['gym'],
      injury_history: profileData.injury_history || '',
      units_preference: profileData.units_preference || 'metric',
      notifications_enabled: profileData.notifications_enabled !== false,
      email_notifications: profileData.email_notifications !== false,
      push_notifications: profileData.push_notifications !== false,
      training_reminders: profileData.training_reminders !== false,
      updated_at: new Date().toISOString(),
    };

    // Add profile photo URL if one was uploaded
    if (profilePhotoUrl) {
      updateData.profile_photo_url = profilePhotoUrl;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Check if training stats exist, create if not
    const { data: existingStats, error: statsCheckError } = await supabase
      .from('training_stats')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (!existingStats && statsCheckError?.code === 'PGRST116') {
      // Create training stats if they don't exist
      const trainingStatsRecord = {
        user_id: user.id,
        total_workouts: 0,
        total_training_days: 0,
        current_streak: 0,
        longest_streak: 0,
        total_training_time_minutes: 0,
        last_workout_date: null,
        favorite_workout_type: null,
        pr_records: {},
        monthly_goals: {},
        achievements: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: statsError } = await supabase
        .from('training_stats')
        .insert([trainingStatsRecord]);

      if (statsError) {
        console.error('Error creating training stats:', statsError);
        // Don't fail the whole process for training stats
      }
    }

    return { success: true };
  }

  /**
   * Sign in an existing user with email and password
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign in with OAuth providers (Google, Apple, etc.)
   */
  async signInWithOAuth(provider) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'medeirosmethod://auth/callback',
        },
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('OAuth sign in error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reset password for a user
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'medeirosmethod://auth/reset-password',
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Password reset email sent',
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get the current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Get the current user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }

      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Delete user account and all associated data
   */
  async deleteAccount() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Call the Edge Function to handle complete account deletion
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        body: { confirm: true }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete account');
      }

      return {
        success: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      console.error('Delete account error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new AuthService(); 