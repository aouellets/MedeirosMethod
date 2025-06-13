import { supabase } from '../lib/supabase';
import StorageService from './StorageService';

class ProfileService {
  // Get current user's profile and training stats
  async getProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // If profile doesn't exist, create it
        if (profileError.code === 'PGRST116') {
          const newProfile = await this.createProfile(user);
          return { profile: newProfile, training_stats: await this.getOrCreateTrainingStats(user.id) };
        }
        throw profileError;
      }

      // Get training stats
      const trainingStats = await this.getOrCreateTrainingStats(user.id);

      return { profile, training_stats: trainingStats };
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Create a new profile for the user
  async createProfile(user, profileData = {}) {
    try {
      // Helper function to format arrays for PostgreSQL
      const formatArrayForPostgres = (arr) => {
        if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
        return arr;
      };

      const defaultProfileData = {
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || profileData.firstName || '',
        last_name: profileData.lastName || '',
        full_name: user.user_metadata?.full_name || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
        date_of_birth: profileData.dateOfBirth || null,
        gender: profileData.gender || null,
        location: profileData.location || '',
        bio: profileData.bio || '',
        fitness_level: profileData.fitnessLevel || 'beginner',
        training_goals: formatArrayForPostgres(profileData.trainingGoals),
        preferred_workout_days: formatArrayForPostgres(profileData.preferredWorkoutDays),
        preferred_workout_time: profileData.preferredWorkoutTime || 'morning',
        equipment_access: profileData.equipmentAccess ? [profileData.equipmentAccess] : ['gym'],
        injury_history: profileData.injuryHistory || '',
        units_preference: profileData.unitsPreference || 'metric',
        notifications_enabled: profileData.notificationsEnabled !== false,
        email_notifications: profileData.emailNotifications !== false,
        push_notifications: profileData.pushNotifications !== false,
        training_reminders: profileData.trainingReminders !== false,
        social_sharing: profileData.socialSharing || false,
        privacy_level: profileData.privacyLevel || 'private'
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([defaultProfileData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Create profile error:', error);
      throw error;
    }
  }

  // Get or create training stats
  async getOrCreateTrainingStats(userId) {
    try {
      let { data: trainingStats, error } = await supabase
        .from('training_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create default training stats
        const { data: newStats, error: createError } = await supabase
          .from('training_stats')
          .insert([{ user_id: userId }])
          .select()
          .single();

        if (createError) {
          throw createError;
        }
        
        trainingStats = newStats;
      } else if (error) {
        throw error;
      }

      return trainingStats;
    } catch (error) {
      console.error('Get training stats error:', error);
      throw error;
    }
  }

  // Update profile information
  async updateProfile(profileData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Update training stats
  async updateTrainingStats(statsData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('training_stats')
        .update(statsData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Update training stats error:', error);
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(notificationData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(notificationData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Update notifications error:', error);
      throw error;
    }
  }

  // Upload avatar image using new StorageService
  async uploadAvatar(imageUri) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Delete old avatar if exists
      await this.deleteAvatar();

      // Upload new avatar using StorageService
      const uploadResult = await StorageService.uploadAvatar(imageUri, user.id);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Update profile with new avatar URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: uploadResult.url })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return uploadResult.url;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  }

  // Delete avatar image
  async deleteAvatar() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get current avatar URL to extract path
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (profile?.avatar_url) {
        // Extract file path from URL
        const url = new URL(profile.avatar_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(-2).join('/'); // Get last two parts (userId/filename)
        
        // Delete from storage
        await StorageService.deleteFile(StorageService.BUCKETS.AVATARS, filePath);
      }

      // Update profile to remove avatar URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Delete avatar error:', error);
      throw error;
    }
  }

  // Record workout completion
  async recordWorkout(workoutData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get current stats
      const currentStats = await this.getOrCreateTrainingStats(user.id);
      
      // Calculate new streak
      const today = new Date().toISOString().split('T')[0];
      const lastWorkout = currentStats.last_workout_date;
      let newStreak = currentStats.current_streak || 0;

      if (lastWorkout) {
        const lastDate = new Date(lastWorkout);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
        // If same day, keep current streak
      } else {
        newStreak = 1;
      }

      // Update stats
      const updatedStats = {
        total_workouts: (currentStats.total_workouts || 0) + 1,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, currentStats.longest_streak || 0),
        last_workout_date: today,
        total_training_time_minutes: (currentStats.total_training_time_minutes || 0) + (workoutData.duration_minutes || 0),
        favorite_workout_type: workoutData.workout_type || currentStats.favorite_workout_type
      };

      return await this.updateTrainingStats(updatedStats);
    } catch (error) {
      console.error('Record workout error:', error);
      throw error;
    }
  }

  // Update personal records
  async updatePersonalRecord(exercise, value, unit = 'kg') {
    try {
      const trainingStats = await this.getOrCreateTrainingStats();
      const currentPRs = trainingStats.pr_records || {};
      
      currentPRs[exercise] = {
        value,
        unit,
        date: new Date().toISOString().split('T')[0]
      };

      return await this.updateTrainingStats({ pr_records: currentPRs });
    } catch (error) {
      console.error('Update PR error:', error);
      throw error;
    }
  }

  // Add achievement
  async addAchievement(achievement) {
    try {
      const trainingStats = await this.getOrCreateTrainingStats();
      const currentAchievements = trainingStats.achievements || [];
      
      if (!currentAchievements.includes(achievement)) {
        currentAchievements.push(achievement);
        return await this.updateTrainingStats({ achievements: currentAchievements });
      }
      
      return trainingStats;
    } catch (error) {
      console.error('Add achievement error:', error);
      throw error;
    }
  }
}

export default new ProfileService(); 