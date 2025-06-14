import { 
  getAllMockPosts, 
  mockPosts, 
  mockYouTubePosts, 
  mockProfiles, 
  mockComments, 
  mockFeaturedPosts 
} from '../data/mockSocialData';

class MockSocialService {
  constructor() {
    // Keep track of local state changes for likes
    this.localPosts = [...getAllMockPosts()];
    this.localLikes = new Set(); // Track which posts the current user has liked
  }

  /**
   * Get social feed posts (mock version)
   */
  async getFeedPosts(limit = 20, offset = 0) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allPosts = this.localPosts.slice(offset, offset + limit);
      
      // Apply local like state
      const postsWithLikes = allPosts.map(post => ({
        ...post,
        is_liked: this.localLikes.has(post.id),
        likes_count: post.likes_count + (this.localLikes.has(post.id) && !post.is_liked ? 1 : 0) - (post.is_liked && !this.localLikes.has(post.id) ? 1 : 0)
      }));

      return { success: true, posts: postsWithLikes };
    } catch (error) {
      console.error('Mock get feed posts error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get post details (mock version)
   */
  async getPostDetails(postId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const post = this.localPosts.find(p => p.id === postId);
      if (!post) {
        return { success: false, error: 'Post not found' };
      }

      const comments = mockComments[postId] || [];
      
      return { 
        success: true, 
        post: {
          ...post,
          is_liked: this.localLikes.has(post.id),
          likes_count: post.likes_count + (this.localLikes.has(post.id) && !post.is_liked ? 1 : 0) - (post.is_liked && !this.localLikes.has(post.id) ? 1 : 0)
        }, 
        comments 
      };
    } catch (error) {
      console.error('Mock get post details error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Like/Unlike a post (mock version)
   */
  async likePost(postId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const isCurrentlyLiked = this.localLikes.has(postId);
      
      if (isCurrentlyLiked) {
        this.localLikes.delete(postId);
        return { success: true, action: 'unliked' };
      } else {
        this.localLikes.add(postId);
        return { success: true, action: 'liked' };
      }
    } catch (error) {
      console.error('Mock like post error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unlike a post (mock version)
   */
  async unlikePost(postId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.localLikes.delete(postId);
      return { success: true };
    } catch (error) {
      console.error('Mock unlike post error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add comment to post (mock version)
   */
  async addComment(postId, content) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const newComment = {
        id: `mock-comment-${Date.now()}`,
        post_id: postId,
        user_id: 'current_user',
        content,
        created_at: new Date().toISOString(),
        profiles: {
          id: 'current_user',
          first_name: 'You',
          last_name: '',
          avatar_url: null
        }
      };

      // Add to mock comments
      if (!mockComments[postId]) {
        mockComments[postId] = [];
      }
      mockComments[postId].unshift(newComment);

      // Update comment count in local posts
      const postIndex = this.localPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        this.localPosts[postIndex].comments_count += 1;
      }

      return { success: true, comment: newComment };
    } catch (error) {
      console.error('Mock add comment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get featured posts (mock version)
   */
  async getFeaturedPosts(limit = 5) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const featured = mockFeaturedPosts.slice(0, limit);
      return { success: true, posts: featured };
    } catch (error) {
      console.error('Mock get featured posts error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create post (mock version) - for demo purposes
   */
  async createPost(content, mediaFiles = [], workoutId = null, exerciseName = null, tags = [], isPublic = true) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPost = {
        id: `mock-post-${Date.now()}`,
        user_id: 'current_user',
        content,
        media_urls: [], // For demo, we won't handle file uploads
        media_types: [],
        workout_id: workoutId,
        exercise_name: exerciseName,
        tags,
        is_public: isPublic,
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        is_liked: false,
        profiles: {
          id: 'current_user',
          first_name: 'You',
          last_name: '',
          avatar_url: null
        }
      };

      // Add to local posts at the beginning
      this.localPosts.unshift(newPost);

      return { success: true, post: newPost };
    } catch (error) {
      console.error('Mock create post error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user posts (mock version)
   */
  async getUserPosts(userId, limit = 20, offset = 0) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const userPosts = this.localPosts
        .filter(post => post.user_id === userId)
        .slice(offset, offset + limit);

      return { success: true, posts: userPosts };
    } catch (error) {
      console.error('Mock get user posts error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get post comments (mock version)
   */
  async getPostComments(postId, limit = 20, offset = 0) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const comments = (mockComments[postId] || []).slice(offset, offset + limit);
      return { success: true, comments };
    } catch (error) {
      console.error('Mock get post comments error:', error);
      return { success: false, error: error.message };
    }
  }

  // Additional mock methods for compatibility
  async toggleLike(postId) {
    return this.likePost(postId);
  }

  async hasLikedPost(postId) {
    return { success: true, liked: this.localLikes.has(postId) };
  }

  async getUserSocialStats(userId) {
    const profile = mockProfiles[userId];
    if (!profile) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      stats: {
        posts_count: profile.posts_count || 0,
        followers_count: profile.followers_count || 0,
        following_count: profile.following_count || 0
      }
    };
  }
}

// Export a singleton instance
export default new MockSocialService(); 