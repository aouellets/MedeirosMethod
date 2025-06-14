import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
// Using MockSocialService for MVP demo
import MockSocialService from '../../services/MockSocialService';
import { sponsors } from '../../data/products';
import { LinearGradient } from 'expo-linear-gradient';
import FeaturedContent from '../../components/social/FeaturedContent';

const { width } = Dimensions.get('window');

const CommunityFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const { success, posts: feedPosts, error: feedError } = await MockSocialService.getFeedPosts();
      if (!success) throw new Error(feedError);
      
      const { success: featuredSuccess, posts: featured, error: featuredError } = 
        await MockSocialService.getFeaturedPosts();
      if (!featuredSuccess) throw new Error(featuredError);

      setPosts(feedPosts);
      setFeaturedPosts(featured);
      
      // Pre-load image dimensions for better layout
      feedPosts.forEach(post => {
        if (post.media_urls && post.media_urls.length > 0) {
          post.media_urls.forEach((imageSource, index) => {
            const imageKey = `${post.id}-${index}`;
            if (!imageDimensions[imageKey]) {
              Image.getSize(
                Image.resolveAssetSource(imageSource).uri,
                (imageWidth, imageHeight) => {
                  const maxWidth = width - 20; // Account for card margins
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
                      width: width - 20,
                      height: (width - 20) * 0.6,
                      aspectRatio: 1.67
                    }
                  }));
                }
              );
            }
          });
        }
      });
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      const { success, error } = await MockSocialService.toggleLike(postId);
      if (!success) throw new Error(error);

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
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={
              item.profiles?.avatar_url 
                ? item.profiles.avatar_url
                : require('../../../assets/logo_transparent.png')
            }
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>
              {item.profiles?.first_name} {item.profiles?.last_name}
            </Text>
            <Text style={styles.postTime}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {item.tags?.includes('youtube') && (
          <View style={styles.youtubeBadge}>
            <Text style={styles.youtubeText}>📹 YOUTUBE</Text>
          </View>
        )}
      </View>

      <View style={styles.postContent}>
        <Text style={styles.caption}>{item.content}</Text>
        
        {item.exercise_name && (
          <View style={styles.exerciseTag}>
            <Text style={styles.exerciseText}>💪 {item.exercise_name}</Text>
          </View>
        )}
        
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
                        width: width - 20,
                        height: (width - 20) * 0.6 // Fallback while loading
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

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>+{item.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id, item.is_liked)}
          >
            <Text style={[styles.actionText, item.is_liked && styles.likedText]}>
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
    </View>
  );

  const ListHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Community Feed</Text>
        <View style={styles.headerRight}>
          <Text style={styles.demoLabel}>MVP DEMO</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Text style={styles.createButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {featuredPosts.length > 0 && (
        <FeaturedContent 
          posts={featuredPosts}
          onPostPress={(post) => navigation.navigate('PostDetail', { postId: post.id })}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feed}
        refreshing={loading}
        onRefresh={loadFeedPosts}
      />

      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.boneWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  demoLabel: {
    fontSize: 10,
    color: colors.slateBlue,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: colors.boneWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  feed: {
    padding: 10,
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
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
    padding: 16,
    paddingTop: 0,
  },
  caption: {
    fontSize: 16,
    color: colors.slateBlue,
    lineHeight: 22,
    marginBottom: 12,
  },
  exerciseTag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  exerciseText: {
    fontSize: 14,
    color: colors.slateBlue,
    fontWeight: '600',
  },
  mediaContainer: {
    marginBottom: 12,
    marginHorizontal: -16, // Extend to card edges
    alignItems: 'center', // Center the images
  },
  postImage: {
    backgroundColor: colors.lightGray,
    borderRadius: 0, // No border radius since it extends to edges
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  actionButton: {
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
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.burntOrange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default CommunityFeedScreen; 