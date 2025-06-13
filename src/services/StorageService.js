import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';

class StorageService {
  // Storage bucket names
  static BUCKETS = {
    AVATARS: 'avatars',
    WORKOUT_MEDIA: 'workout-media',
    PROGRESS_PHOTOS: 'progress-photos',
    SOCIAL_POSTS: 'social-posts',
    EXERCISE_DEMOS: 'exercise-demos',
    THUMBNAILS: 'thumbnails'
  };

  // File type configurations
  static FILE_CONFIGS = {
    IMAGE: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      extensions: ['.jpg', '.jpeg', '.png', '.webp']
    },
    VIDEO: {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['video/mp4', 'video/mov', 'video/avi'],
      extensions: ['.mp4', '.mov', '.avi']
    }
  };

  /**
   * Initialize storage buckets (run this once during app setup)
   * Note: Buckets are now created via database migrations, so this method
   * just verifies they exist by trying to access them.
   */
  static async initializeBuckets() {
    try {
      // Check if supabase is properly initialized
      if (!supabase || !supabase.storage) {
        throw new Error('Supabase client not properly initialized');
      }

      const buckets = Object.values(this.BUCKETS);
      let bucketsExisted = 0;
      let bucketsSkipped = 0;
      
      // Instead of trying to list or create buckets (which requires admin permissions),
      // we'll test if we can access each bucket by attempting a simple operation
      for (const bucketName of buckets) {
        try {
          // Try to list files in the bucket (this will work if bucket exists and we have access)
          const { data, error } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 1 });
          
          if (!error) {
            bucketsExisted++;
            console.log(`Bucket ${bucketName} is accessible`);
          } else {
            // If we get a permission error but bucket exists, that's still success
            if (error.message.includes('permission') || error.message.includes('policy')) {
              bucketsExisted++;
              console.log(`Bucket ${bucketName} exists (access restricted by policy)`);
            } else {
              console.warn(`Bucket ${bucketName} may not exist:`, error.message);
              bucketsSkipped++;
            }
          }
        } catch (bucketError) {
          console.warn(`Cannot verify bucket ${bucketName}:`, bucketError.message);
          bucketsSkipped++;
        }
      }

      const message = `Storage initialization complete. Accessible: ${bucketsExisted}, Issues: ${bucketsSkipped}`;
      console.log(message);
      
      return { 
        success: true, 
        message,
        note: 'Storage buckets are created via database migrations. If any buckets are missing, check the migration status.'
      };
    } catch (error) {
      console.error('Error initializing buckets:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload avatar image
   */
  static async uploadAvatar(imageUri, userId) {
    return this.uploadFile(imageUri, this.BUCKETS.AVATARS, `${userId}/avatar`, 'IMAGE');
  }

  /**
   * Upload workout media (photos/videos)
   */
  static async uploadWorkoutMedia(mediaUri, userId, workoutId, mediaType = 'IMAGE') {
    const folder = `${userId}/workouts/${workoutId}`;
    return this.uploadFile(mediaUri, this.BUCKETS.WORKOUT_MEDIA, folder, mediaType);
  }

  /**
   * Upload progress photos
   */
  static async uploadProgressPhoto(imageUri, userId, date) {
    const folder = `${userId}/progress/${date}`;
    return this.uploadFile(imageUri, this.BUCKETS.PROGRESS_PHOTOS, folder, 'IMAGE');
  }

  /**
   * Upload social post media
   */
  static async uploadSocialMedia(mediaUri, userId, postId, mediaType = 'IMAGE') {
    const folder = `${userId}/posts/${postId}`;
    return this.uploadFile(mediaUri, this.BUCKETS.SOCIAL_POSTS, folder, mediaType);
  }

  /**
   * Upload exercise demonstration media
   */
  static async uploadExerciseDemo(mediaUri, exerciseId, mediaType = 'VIDEO') {
    const folder = `exercises/${exerciseId}`;
    return this.uploadFile(mediaUri, this.BUCKETS.EXERCISE_DEMOS, folder, mediaType);
  }

  /**
   * Generic file upload method
   */
  static async uploadFile(fileUri, bucketName, folderPath, fileType = 'IMAGE') {
    try {
      // Validate file
      const validation = await this.validateFile(fileUri, fileType);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Generate unique filename
      const fileExtension = this.getFileExtension(fileUri);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      // Create FormData for React Native file upload
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: this.getMimeType(fileExtension),
        name: fileName,
      });

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, formData, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrl,
        path: filePath,
        fileName: fileName,
        size: fileInfo.size
      };
    } catch (error) {
      console.error('Upload file error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(bucketName, filePath) {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Delete file error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * List files in a folder
   */
  static async listFiles(bucketName, folderPath = '') {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folderPath);

      if (error) {
        throw error;
      }

      return { success: true, files: data };
    } catch (error) {
      console.error('List files error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate thumbnail for video
   */
  static async generateThumbnail(videoUri, userId) {
    try {
      // This would typically use a video processing library
      // For now, we'll return a placeholder implementation
      console.log('Thumbnail generation not implemented yet');
      return { success: false, error: 'Thumbnail generation not implemented' };
    } catch (error) {
      console.error('Generate thumbnail error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate file before upload
   */
  static async validateFile(fileUri, fileType) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (!fileInfo.exists) {
        return { valid: false, error: 'File does not exist' };
      }

      const config = this.FILE_CONFIGS[fileType];
      if (!config) {
        return { valid: false, error: 'Invalid file type configuration' };
      }

      // Check file size
      if (fileInfo.size > config.maxSize) {
        const maxSizeMB = config.maxSize / (1024 * 1024);
        return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
      }

      // Check file extension
      const extension = this.getFileExtension(fileUri).toLowerCase();
      if (!config.extensions.includes(extension)) {
        return { valid: false, error: `File type ${extension} not allowed` };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get file extension from URI
   */
  static getFileExtension(uri) {
    const lastDot = uri.lastIndexOf('.');
    return lastDot !== -1 ? uri.substring(lastDot) : '';
  }

  /**
   * Get MIME type from file extension
   */
  static getMimeType(extension) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo'
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Get storage usage for a user
   */
  static async getStorageUsage(userId) {
    try {
      let totalSize = 0;
      const bucketUsage = {};

      for (const [key, bucketName] of Object.entries(this.BUCKETS)) {
        const { data: files } = await supabase.storage
          .from(bucketName)
          .list(userId, { limit: 1000 });

        if (files) {
          const bucketSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
          bucketUsage[key] = bucketSize;
          totalSize += bucketSize;
        }
      }

      return {
        success: true,
        totalSize,
        bucketUsage,
        totalSizeMB: totalSize / (1024 * 1024)
      };
    } catch (error) {
      console.error('Get storage usage error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up old files (for maintenance)
   */
  static async cleanupOldFiles(bucketName, olderThanDays = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { data: files } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1000 });

      if (!files) return { success: true, deletedCount: 0 };

      const filesToDelete = files.filter(file => {
        const fileDate = new Date(file.created_at);
        return fileDate < cutoffDate;
      });

      if (filesToDelete.length > 0) {
        const filePaths = filesToDelete.map(file => file.name);
        const { error } = await supabase.storage
          .from(bucketName)
          .remove(filePaths);

        if (error) throw error;
      }

      return { success: true, deletedCount: filesToDelete.length };
    } catch (error) {
      console.error('Cleanup old files error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default StorageService; 