import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import ProfileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [trainingStats, setTrainingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await ProfileService.getProfile();
      setProfile(result.profile);
      setTrainingStats(result.training_stats);
    } catch (err) {
      console.error('Load profile error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update profile data
  const updateProfile = useCallback(async (profileData) => {
    try {
      setUpdating(true);
      setError(null);
      
      const updatedProfile = await ProfileService.updateProfile(profileData);
      setProfile(updatedProfile);
      
      return { success: true, profile: updatedProfile };
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, []);

  // Update training stats
  const updateTrainingStats = useCallback(async (statsData) => {
    try {
      setUpdating(true);
      setError(null);
      
      const updatedStats = await ProfileService.updateTrainingStats(statsData);
      setTrainingStats(updatedStats);
      
      return { success: true, stats: updatedStats };
    } catch (err) {
      console.error('Update training stats error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, []);

  // Upload profile photo
  const uploadProfilePhoto = useCallback(async (imageUri) => {
    try {
      setUpdating(true);
      setError(null);
      
      const photoUrl = await ProfileService.uploadAvatar(imageUri);
      
      // Update profile with new photo URL
      const updatedProfile = await ProfileService.updateProfile({
        profile_photo_url: photoUrl
      });
      
      setProfile(updatedProfile);
      
      return { success: true, photoUrl, profile: updatedProfile };
    } catch (err) {
      console.error('Upload profile photo error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, []);

  // Delete profile photo
  const deleteProfilePhoto = useCallback(async () => {
    try {
      setUpdating(true);
      setError(null);
      
      await ProfileService.deleteAvatar();
      
      // Update profile to remove photo URL
      const updatedProfile = await ProfileService.updateProfile({
        profile_photo_url: null
      });
      
      setProfile(updatedProfile);
      
      return { success: true, profile: updatedProfile };
    } catch (err) {
      console.error('Delete profile photo error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, []);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  // Load profile when user changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    // Data
    profile,
    trainingStats,
    
    // State
    loading,
    updating,
    error,
    
    // Actions
    loadProfile,
    updateProfile,
    updateTrainingStats,
    uploadProfilePhoto,
    deleteProfilePhoto,
    refreshProfile,
    
    // Helpers
    isLoaded: !loading && profile !== null,
    hasError: error !== null,
  };
}; 