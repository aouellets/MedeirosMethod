import { supabase } from '../lib/supabase';
import StorageService from './StorageService';

class SocialService {
  /**
   * Create a new social post
   */
  async createPost(content, mediaFiles = [], workoutId = null, exerciseName = null, tags = [], isPublic = true) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');
      
      // Upload media files if any
      let mediaUrls = [];
      let mediaTypes = [];
      
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const fileExt = file.uri.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('social-posts')
            .upload(filePath, {
              uri: file.uri,
              type: file.type,
              name: fileName
            });
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('social-posts')
            .getPublicUrl(filePath);
            
          mediaUrls.push(publicUrl);
          mediaTypes.push(file.type);
        }
      }
      
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          content,
          media_urls: mediaUrls,
          media_types: mediaTypes,
          workout_id: workoutId,
          exercise_name: exerciseName,
          tags,
          is_public: isPublic
        })
        .select()
        .single();
        
      if (error) throw error;
      return { success: true, post: data };
    } catch (error) {
      console.error('Create post error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get social feed posts
   */
  async getFeedPosts(limit = 20, offset = 0) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');

      // First get the posts
      const { data: posts, error: postsError } = await supabase
        .from('social_posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (postsError) throw postsError;

      // Then get the likes for these posts
      const { data: likes, error: likesError } = await supabase
        .from('social_likes')
        .select('*')
        .in('post_id', posts.map(p => p.id));

      if (likesError) throw likesError;

      // Get profiles for all post authors
      const userIds = [...new Set(posts.map(p => p.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Transform the data
      const transformedPosts = posts.map(post => {
        const postProfile = profiles.find(p => p.id === post.user_id);
        const postLikes = likes.filter(l => l.post_id === post.id);
        
        return {
          ...post,
          is_liked: postLikes.some(like => like.user_id === user.id),
          profiles: postProfile || null
        };
      });

      return { success: true, posts: transformedPosts };
    } catch (error) {
      console.error('Get feed posts error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId, limit = 20, offset = 0) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          likes:social_likes (
            id,
            user_id
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Transform the data to include is_liked flag
      const posts = data.map(post => ({
        ...post,
        is_liked: post.likes.some(like => like.user_id === user.id)
      }));

      return { success: true, posts };
    } catch (error) {
      console.error('Get user posts error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Like a post
   */
  async likePost(postId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');

      // First check if the like already exists
      const { data: existingLike, error: checkError } = await supabase
        .from('social_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingLike) {
        // Unlike the post
        const { error: deleteError } = await supabase
          .from('social_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) throw deleteError;
        return { success: true, action: 'unliked' };
      } else {
        // Like the post
        const { error: insertError } = await supabase
          .from('social_likes')
          .insert([{ user_id: user.id, post_id: postId }]);

        if (insertError) throw insertError;
        return { success: true, action: 'liked' };
      }
    } catch (error) {
      console.error('Like post error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('social_likes')
        .delete()
        .match({
          post_id: postId,
          user_id: user.id
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Unlike post error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get comments for a post
   */
  async getPostComments(postId, limit = 20, offset = 0) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');

      // Check if post exists and is public
      const { data: post, error: postError } = await supabase
        .from('social_posts')
        .select('is_public, user_id')
        .eq('id', postId)
        .single();

      if (postError) throw new Error('Post not found');
      if (!post.is_public && post.user_id !== user.id) {
        throw new Error('Cannot view comments on private post');
      }

      const { data, error } = await supabase
        .from('social_comments')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { success: true, comments: data };
    } catch (error) {
      console.error('Get post comments error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a comment to a post
   */
  async addComment(postId, content) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');

      const { data: comment, error } = await supabase
        .from('social_comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: content
          }
        ])
        .select(`
          *,
          user:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return { success: true, comment };
    } catch (error) {
      console.error('Add comment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's social stats
   */
  async getUserSocialStats(userId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');

      const [
        { count: postsCount },
        { count: followersCount },
        { count: followingCount }
      ] = await Promise.all([
        supabase.from('social_posts').select('*', { count: 'exact' }).eq('user_id', userId),
        supabase.from('user_follows').select('*', { count: 'exact' }).eq('following_id', userId),
        supabase.from('user_follows').select('*', { count: 'exact' }).eq('follower_id', userId)
      ]);

      return {
        success: true,
        stats: {
          posts: postsCount,
          followers: followersCount,
          following: followingCount
        }
      };
    } catch (error) {
      console.error('Get user social stats error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Follow a user
   */
  async followUser(userId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_follows')
        .insert([{
          follower_id: user.id,
          following_id: userId
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, follow: data };
    } catch (error) {
      console.error('Follow user error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(userId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Unfollow user error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          created_at,
          profiles:follower_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return { success: true, followers: data };
    } catch (error) {
      console.error('Get followers error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          following_id,
          created_at,
          profiles:following_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return { success: true, following: data };
    } catch (error) {
      console.error('Get following error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload progress photo
   */
  async uploadProgressPhoto(photoData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Upload photo to storage
      const uploadResult = await StorageService.uploadProgressPhoto(
        photoData.photoUri,
        user.id,
        photoData.date
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Save progress photo record
      const { data, error } = await supabase
        .from('progress_photos')
        .insert([{
          user_id: user.id,
          photo_url: uploadResult.url,
          photo_date: photoData.date,
          weight_kg: photoData.weight,
          body_fat_percentage: photoData.bodyFat,
          muscle_mass_kg: photoData.muscleMass,
          notes: photoData.notes,
          measurements: photoData.measurements,
          is_public: photoData.isPublic || false
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, progressPhoto: data };
    } catch (error) {
      console.error('Upload progress photo error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's progress photos
   */
  async getProgressPhotos(userId, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', userId)
        .order('photo_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return { success: true, photos: data };
    } catch (error) {
      console.error('Get progress photos error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload workout media
   */
  async uploadWorkoutMedia(mediaData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Upload media to storage
      const uploadResult = await StorageService.uploadWorkoutMedia(
        mediaData.mediaUri,
        user.id,
        mediaData.workoutId || Date.now().toString(),
        mediaData.mediaType
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Save workout media record
      const { data, error } = await supabase
        .from('workout_media')
        .insert([{
          user_id: user.id,
          workout_id: mediaData.workoutId,
          exercise_name: mediaData.exerciseName,
          media_url: uploadResult.url,
          media_type: mediaData.mediaType,
          thumbnail_url: mediaData.thumbnailUrl,
          duration_seconds: mediaData.duration,
          description: mediaData.description,
          tags: mediaData.tags || [],
          is_public: mediaData.isPublic || false
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, workoutMedia: data };
    } catch (error) {
      console.error('Upload workout media error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search users
   */
  async searchUsers(query, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        throw error;
      }

      return { success: true, users: data };
    } catch (error) {
      console.error('Search users error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if current user is following another user
   */
  async isFollowing(userId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: true, isFollowing: false };
      }

      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { success: true, isFollowing: !!data };
    } catch (error) {
      console.error('Check is following error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if current user has liked a post
   */
  async hasLikedPost(postId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: true, hasLiked: false };
      }

      const { data, error } = await supabase
        .from('social_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { success: true, hasLiked: !!data };
    } catch (error) {
      console.error('Check has liked post error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get featured posts
   */
  async getFeaturedPosts(limit = 5) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');

      const { data: posts, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          likes:social_likes (
            id,
            user_id
          )
        `)
        .or('is_featured.eq.true,is_sponsored.eq.true')
        .gte('featured_until', new Date().toISOString())
        .order('engagement_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform the data to include is_liked flag
      const transformedPosts = posts.map(post => ({
        ...post,
        is_liked: post.likes.some(like => like.user_id === user.id)
      }));

      return { success: true, posts: transformedPosts };
    } catch (error) {
      console.error('Get featured posts error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a sponsored post
   */
  async createSponsoredPost(content, mediaFiles = [], sponsorId, featuredUntil = null) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');
      
      // Upload media files if any
      let mediaUrls = [];
      let mediaTypes = [];
      
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const fileExt = file.uri.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('social-posts')
            .upload(filePath, {
              uri: file.uri,
              type: file.type,
              name: fileName
            });
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('social-posts')
            .getPublicUrl(filePath);
            
          mediaUrls.push(publicUrl);
          mediaTypes.push(file.type);
        }
      }
      
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          content,
          media_urls: mediaUrls,
          media_types: mediaTypes,
          is_sponsored: true,
          sponsor_id: sponsorId,
          featured_until: featuredUntil,
          is_public: true
        })
        .select()
        .single();
        
      if (error) throw error;
      return { success: true, post: data };
    } catch (error) {
      console.error('Create sponsored post error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Feature a post
   */
  async featurePost(postId, featuredUntil) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');

      // Check if user has permission to feature posts
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!['admin', 'moderator'].includes(profile.role)) {
        throw new Error('Unauthorized to feature posts');
      }

      const { data, error } = await supabase
        .from('social_posts')
        .update({
          is_featured: true,
          featured_until: featuredUntil
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, post: data };
    } catch (error) {
      console.error('Feature post error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get trending posts based on engagement
   */
  async getTrendingPosts(limit = 20, timeframe = '24h') {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User not authenticated');

      const timeFilter = new Date();
      switch (timeframe) {
        case '1h':
          timeFilter.setHours(timeFilter.getHours() - 1);
          break;
        case '24h':
          timeFilter.setDate(timeFilter.getDate() - 1);
          break;
        case '7d':
          timeFilter.setDate(timeFilter.getDate() - 7);
          break;
        case '30d':
          timeFilter.setDate(timeFilter.getDate() - 30);
          break;
      }

      const { data: posts, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          likes:social_likes (
            id,
            user_id
          )
        `)
        .eq('is_public', true)
        .gte('created_at', timeFilter.toISOString())
        .order('engagement_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform the data to include is_liked flag
      const transformedPosts = posts.map(post => ({
        ...post,
        is_liked: post.likes.some(like => like.user_id === user.id)
      }));

      return { success: true, posts: transformedPosts };
    } catch (error) {
      console.error('Get trending posts error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get post details with comments
   */
  async getPostDetails(postId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      // Get post details with user profile
      const { data: post, error: postError } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('id', postId)
        .single();

      if (postError) throw postError;
      if (!post) throw new Error('Post not found');

      // Get comments with user profiles
      const { data: comments, error: commentsError } = await supabase
        .from('social_comments')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Get user's like status
      const { data: like, error: likeError } = await supabase
        .from('social_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (likeError && likeError.code !== 'PGRST116') throw likeError;

      return {
        success: true,
        post: {
          ...post,
          is_liked: !!like
        },
        comments: comments || []
      };
    } catch (error) {
      console.error('Error in getPostDetails:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new SocialService(); 