import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
// Using MockSocialService for MVP demo
import MockSocialService from '../../services/MockSocialService';

const { width } = Dimensions.get('window');

const SocialFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({});

  useEffect(() => {
    loadFeedPosts();
    
    // Set up navigation listener to refresh when coming back to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadFeedPosts();
    });

    return unsubscribe;
  }, [navigation]);

  const loadFeedPosts = async () => {
    try {
      setError(null);
      const result = await MockSocialService.getFeedPosts(20, 0);
      if (result.success) {
        setPosts(result.posts);
        // Pre-load image dimensions for better layout
        result.posts.forEach(post => {
          if (post.media_urls && post.media_urls.length > 0) {
            post.media_urls.forEach((imageSource, index) => {
              const imageKey = `${post.id}-${index}`;
              if (!imageDimensions[imageKey]) {
                Image.getSize(
                  Image.resolveAssetSource(imageSource).uri,
                  (imageWidth, imageHeight) => {
                    const maxWidth = width - 30; // Account for padding
                    const aspectRatio = imageWidth / imageHeight;
                    const displayHeight = maxWidth / aspectRatio;
                    
                    setImageDimensions(prev => ({
                      ...prev,
                      [imageKey]: {
                        width: maxWidth,
                        height: Math.min(displayHeight, 400), // Max height to prevent extremely tall images
                        aspectRatio
                      }
                    }));
                  },
                  (error) => {
                    console.log('Error getting image size:', error);
                    // Fallback dimensions
                    setImageDimensions(prev => ({
                      ...prev,
                      [imageKey]: {
                        width: width - 30,
                        height: (width - 30) * 0.6,
                        aspectRatio: 1.67
                      }
                    }));
                  }
                );
              }
            });
          }
        });
      } else {
        setError(result.error || 'Failed to load social feed');
      }
    } catch (error) {
      console.error('Load feed error:', error);
      setError('Failed to load social feed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeedPosts();
    setRefreshing(false);
  };

  const handleLikePost = async (postId, isLiked) => {
    try {
      const result = isLiked 
        ? await MockSocialService.unlikePost(postId)
        : await MockSocialService.likePost(postId);

      if (result.success) {
        // Update local state immediately for responsive UI
        setPosts(currentPosts => 
          currentPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  is_liked: !isLiked,
                  likes_count: isLiked 
                    ? Math.max(0, post.likes_count - 1) 
                    : post.likes_count + 1
                }
              : post
          )
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update like');
      }
    } catch (error) {
      console.error('Like post error:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      {/* User Header */}
      <View style={styles.postHeader}>
        <Image
          source={
            item.profiles?.avatar_url
              ? item.profiles.avatar_url
              : require('../../../assets/logo_transparent.png')
          }
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.profiles?.first_name} {item.profiles?.last_name}
          </Text>
          <Text style={styles.postTime}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        {item.tags?.includes('youtube') && (
          <View style={styles.youtubeBadge}>
            <Text style={styles.youtubeText}>📹 YOUTUBE</Text>
          </View>
        )}
      </View>

      {/* Post Content */}
      {item.content && (
        <Text style={styles.postContent}>{item.content}</Text>
      )}

      {/* Exercise Name */}
      {item.exercise_name && (
        <View style={styles.exerciseTag}>
          <Text style={styles.exerciseText}>💪 {item.exercise_name}</Text>
        </View>
      )}

      {/* Media */}
      {item.media_urls && item.media_urls.length > 0 && (
        <View style={styles.mediaContainer}>
          {item.media_urls.map((imageSource, index) => {
            const imageKey = `${item.id}-${index}`;
            const dimensions = imageDimensions[imageKey];
            
            return (
              <TouchableOpacity
                key={imageKey}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              >
                <Image
                  source={imageSource}
                  style={[
                    styles.postImage,
                    dimensions ? {
                      width: dimensions.width,
                      height: dimensions.height
                    } : {
                      width: width - 30,
                      height: (width - 30) * 0.6 // Fallback while loading
                    }
                  ]}
                  resizeMode="cover"
                  onError={(error) => console.log('Image load error:', error)}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 4).map((tag, index) => (
            <View key={`${item.id}-tag-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {item.tags.length > 4 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>+{item.tags.length - 4}</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLikePost(item.id, item.is_liked)}
        >
          <Text style={[
            styles.actionText, 
            item.is_liked && styles.likedText
          ]}>
            {item.is_liked ? '❤️' : '🤍'} {item.likes_count || 0}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        >
          <Text style={styles.actionText}>💬 {item.comments_count || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>📤 {item.shares_count || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Welcome to the Community!</Text>
      <Text style={styles.emptyText}>
        This is a preview of the social feed featuring Justin Medeiros' training content and YouTube videos.
      </Text>
      <TouchableOpacity
        style={styles.createPostButton}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.createPostText}>Create Demo Post</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadFeedPosts}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.slateBlue, colors.burntOrange]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Loading social feed...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.slateBlue, colors.burntOrange]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Feed</Text>
        <View style={styles.headerRight}>
          <Text style={styles.demoLabel}>MVP DEMO</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Text style={styles.createButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          style={styles.feedList}
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.white}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  demoLabel: {
    fontSize: 10,
    color: colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: 'bold',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.burntOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.white,
    marginTop: 10,
  },
  feedList: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  postContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    marginBottom: 15,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  postTime: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  youtubeBadge: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  youtubeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  postContent: {
    fontSize: 16,
    color: colors.darkGray,
    lineHeight: 22,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  exerciseTag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  exerciseText: {
    fontSize: 14,
    color: colors.slateBlue,
    fontWeight: '600',
  },
  mediaContainer: {
    marginBottom: 10,
    alignItems: 'center', // Center the images
  },
  postImage: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 15,
    color: colors.slateBlue,
    fontWeight: '600',
  },
  likedText: {
    color: colors.burntOrange,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
    lineHeight: 22,
  },
  createPostButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createPostText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  retryButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retryButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default SocialFeedScreen; 