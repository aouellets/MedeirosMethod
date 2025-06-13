import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import SocialService from '../../services/SocialService';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

const PostDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPostDetails();
  }, [postId]);

  const loadPostDetails = async () => {
    try {
      setLoading(true);
      const { success, post: postData, comments: commentsData, error } = await SocialService.getPostDetails(postId);
      if (success) {
        setPost(postData);
        setComments(commentsData || []);
      } else {
        console.error('Error loading post:', error);
      }
    } catch (error) {
      console.error('Error in loadPostDetails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const { success, action, error } = await SocialService.likePost(postId);
      if (success) {
        setPost(prevPost => ({
          ...prevPost,
          is_liked: action === 'liked',
          likes_count: action === 'liked' 
            ? (prevPost.likes_count || 0) + 1 
            : Math.max((prevPost.likes_count || 0) - 1, 0)
        }));
      } else {
        console.error('Error liking post:', error);
      }
    } catch (error) {
      console.error('Error in handleLike:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const { success, comment, error } = await SocialService.addComment(postId, newComment.trim());
      if (success) {
        setComments(prevComments => [...prevComments, comment]);
        setNewComment('');
        setPost(prevPost => ({
          ...prevPost,
          comments_count: (prevPost.comments_count || 0) + 1
        }));
      } else {
        console.error('Error adding comment:', error);
      }
    } catch (error) {
      console.error('Error in handleComment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Image
        source={
          item.profiles?.avatar_url
            ? { uri: item.profiles.avatar_url }
            : require('../../../assets/logo_transparent.png')
        }
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentName}>
          {item.profiles?.first_name} {item.profiles?.last_name}
        </Text>
        <Text style={styles.commentText}>{item.content}</Text>
        <Text style={styles.commentTime}>
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </Text>
      </View>
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
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.slateBlue, colors.burntOrange]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Image
              source={
                post?.profiles?.avatar_url
                  ? { uri: post.profiles.avatar_url }
                  : require('../../../assets/logo_transparent.png')
              }
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {post?.profiles?.first_name} {post?.profiles?.last_name}
              </Text>
              <Text style={styles.postTime}>
                {formatDistanceToNow(new Date(post?.created_at), { addSuffix: true })}
              </Text>
            </View>
          </View>

          {post?.content && (
            <Text style={styles.postContent}>{post.content}</Text>
          )}

          {post?.media_urls && post.media_urls.length > 0 && (
            <View style={styles.mediaContainer}>
              {post.media_urls.map((url, index) => (
                <Image
                  key={`${post.id}-media-${index}`}
                  source={{ uri: url }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLike}
            >
              <Ionicons 
                name={post?.is_liked ? "heart" : "heart-outline"} 
                size={24} 
                color={post?.is_liked ? colors.primary : colors.text}
              />
              <Text style={styles.actionText}>{post?.likes_count || 0}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
              <Text style={styles.actionText}>💬 {post?.comments_count || 0}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>Comments</Text>
            </View>
          )}
          contentContainerStyle={styles.commentsList}
        />
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.commentInputContainer}
      >
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor={colors.gray}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[styles.commentButton, !newComment.trim() && styles.commentButtonDisabled]}
          onPress={handleComment}
          disabled={!newComment.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.commentButtonText}>
              {submitting ? 'Posting...' : 'Post'}
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
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
  postContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
  },
  postContent: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 10,
    lineHeight: 22,
  },
  mediaContainer: {
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 14,
    color: colors.slateBlue,
    fontWeight: '500',
  },
  commentsList: {
    padding: 15,
  },
  commentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  commentText: {
    fontSize: 14,
    color: colors.darkGray,
    marginVertical: 5,
  },
  commentTime: {
    fontSize: 12,
    color: colors.gray,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    color: colors.darkGray,
  },
  commentButton: {
    backgroundColor: colors.burntOrange,
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  commentButtonDisabled: {
    opacity: 0.5,
  },
  commentButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
});

export default PostDetailScreen; 