import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { SocialService } from '../../services/SocialService';
import { sponsors } from '../../data/products';
import { LinearGradient } from 'expo-linear-gradient';
import FeaturedContent from '../../components/social/FeaturedContent';

const { width } = Dimensions.get('window');

const CommunityFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFeedPosts();
  }, []);

  const loadFeedPosts = async () => {
    try {
      setLoading(true);
      const { success, posts: feedPosts, error: feedError } = await SocialService.getFeedPosts();
      if (!success) throw new Error(feedError);
      
      const { success: featuredSuccess, posts: featured, error: featuredError } = 
        await SocialService.getFeaturedPosts();
      if (!featuredSuccess) throw new Error(featuredError);

      setPosts(feedPosts);
      setFeaturedPosts(featured);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      const { success, error } = await SocialService.toggleLike(postId);
      if (!success) throw new Error(error);

      // Update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !isLiked,
              likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={item.profiles?.avatar_url ? { uri: item.profiles.avatar_url } : require('../../../assets/logo_transparent.png')}
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
        {item.is_sponsored && (
          <View style={styles.sponsoredBadge}>
            <Text style={styles.sponsoredText}>Sponsored</Text>
          </View>
        )}
      </View>

      <View style={styles.postContent}>
        <Text style={styles.caption}>{item.content}</Text>
        
        {item.media_urls && item.media_urls.length > 0 && (
          <View style={styles.mediaContainer}>
            {item.media_urls.map((url, index) => (
              <Image
                key={`${item.id}-media-${index}`}
                source={{ uri: url }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tags}>
            {item.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>#{tag}</Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id, item.is_liked)}
        >
          <Text style={[styles.actionIcon, item.is_liked && styles.likedIcon]}>
            {item.is_liked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.actionText}>{item.likes_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{item.comments_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>{item.shares_count || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.createButtonText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      <FeaturedContent 
        posts={featuredPosts}
        onPostPress={(postId) => navigation.navigate('PostDetail', { postId })}
      />
    </>
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
        onPress={() => navigation.navigate('Challenges')}
      >
        <Text style={styles.floatingButtonText}>🏆</Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  sponsoredBadge: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sponsoredText: {
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
    marginBottom: 10,
  },
  mediaContainer: {
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    fontSize: 12,
    color: colors.burntOrange,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  likedIcon: {
    // Already using ❤️ emoji for liked state
  },
  actionText: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: colors.burntOrange,
    width: 56,
    height: 56,
    borderRadius: 28,
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
  },
});

export default CommunityFeedScreen; 