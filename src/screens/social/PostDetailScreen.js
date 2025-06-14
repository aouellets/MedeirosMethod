import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
// Using MockSocialService for MVP demo
import MockSocialService from '../../services/MockSocialService';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get('window');

const PostDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({});
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadPostDetails();
  }, [postId]);

  const loadPostDetails = async () => {
    try {
      setLoading(true);
      const result = await MockSocialService.getPostDetails(postId);
      if (result.success) {
        setPost(result.post);
        setComments(result.comments || []);
        
        // Pre-load image dimensions for better layout
        if (result.post.media_urls && result.post.media_urls.length > 0) {
          result.post.media_urls.forEach((imageSource, index) => {
            const imageKey = `${result.post.id}-${index}`;
            Image.getSize(
              Image.resolveAssetSource(imageSource).uri,
              (imageWidth, imageHeight) => {
                const maxWidth = width - 30;
                const aspectRatio = imageWidth / imageHeight;
                const displayHeight = maxWidth / aspectRatio;
                
                setImageDimensions(prev => ({
                  ...prev,
                  [imageKey]: {
                    width: maxWidth,
                    height: Math.min(displayHeight, 500),
                    aspectRatio
                  }
                }));
              },
              (error) => {
                console.log('Error getting image size:', error);
                setImageDimensions(prev => ({
                  ...prev,
                  [imageKey]: {
                    width: width - 30,
                    height: 280,
                    aspectRatio: 1.67
                  }
                }));
              }
            );
          });
        }
      }
    } catch (error) {
      console.error('Load post details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const result = post.is_liked 
        ? await MockSocialService.unlikePost(postId)
        : await MockSocialService.likePost(postId);

      if (result.success) {
        setPost(prev => ({
          ...prev,
          is_liked: !prev.is_liked,
          likes_count: prev.is_liked 
            ? Math.max(0, prev.likes_count - 1) 
            : prev.likes_count + 1
        }));
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const result = await MockSocialService.addComment(postId, newComment.trim());
      
      if (result.success) {
        setComments(prev => [result.comment, ...prev]);
        setPost(prev => ({
          ...prev,
          comments_count: prev.comments_count + 1
        }));
        setNewComment('');
        Keyboard.dismiss();
        
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ 
            y: 500,
            animated: true
          });
        }, 100);
      }
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToComments = () => {
    console.log('Scroll to comments called');
    scrollViewRef.current?.scrollTo({ 
      y: 400,
      animated: true
    });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.slateBlue, colors.burntOrange]}
        style={styles.container}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post Details</Text>
            <Text style={styles.demoLabel}>MVP DEMO</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.loadingText}>Loading post...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!post) {
    return (
      <LinearGradient
        colors={[colors.slateBlue, colors.burntOrange]}
        style={styles.container}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post Details</Text>
            <Text style={styles.demoLabel}>MVP DEMO</Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Post not found</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.slateBlue, colors.burntOrange]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Details</Text>
          <Text style={styles.demoLabel}>MVP DEMO</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Post */}
            <View style={styles.postContainer}>
              <View style={styles.postHeader}>
                <Image
                  source={
                    post?.profiles?.avatar_url
                      ? post.profiles.avatar_url
                      : require('../../../assets/logo_transparent.png')
                  }
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {post?.profiles?.first_name} {post?.profiles?.last_name}
                  </Text>
                  <Text style={styles.postTime}>
                    {post?.created_at && formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post?.content}</Text>

              {post?.media_urls && post.media_urls.length > 0 && (
                <View style={styles.mediaContainer}>
                  {post.media_urls.map((url, index) => {
                    const imageKey = `${post.id}-${index}`;
                    const dimensions = imageDimensions[imageKey];
                    
                    return (
                      <Image
                        key={imageKey}
                        source={url}
                        style={[
                          styles.postImage,
                          dimensions ? {
                            width: dimensions.width,
                            height: dimensions.height
                          } : {
                            width: width - 30,
                            height: 280
                          }
                        ]}
                        resizeMode="cover"
                      />
                    );
                  })}
                </View>
              )}

              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                  <Text style={[styles.actionText, post?.is_liked && { color: colors.burntOrange }]}>
                    {post?.is_liked ? '❤️' : '🤍'}
                  </Text>
                  <Text style={[styles.actionText, post?.is_liked && { color: colors.burntOrange }]}>
                    {post?.likes_count || 0}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} onPress={scrollToComments}>
                  <Text style={styles.actionText}>💬</Text>
                  <Text style={styles.actionText}>{post?.comments_count || 0}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionText}>📤</Text>
                  <Text style={styles.actionText}>{post?.shares_count || 0}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Comments Section */}
            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>
                Comments ({comments.length})
              </Text>
              {comments.length === 0 && (
                <Text style={styles.noCommentsText}>
                  Be the first to comment! 💬
                </Text>
              )}
            </View>

            {/* Comments List */}
            {comments.map((comment, index) => (
              <View key={`comment-${index}`} style={styles.commentContainer}>
                <Image
                  source={
                    comment.profiles?.avatar_url
                      ? comment.profiles.avatar_url
                      : require('../../../assets/logo_transparent.png')
                  }
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <Text style={styles.commentName}>
                    {comment.profiles?.first_name} {comment.profiles?.last_name}
                  </Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <Text style={styles.commentTime}>
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </Text>
                </View>
              </View>
            ))}

            {/* Extra space at bottom */}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Comment Input - Fixed at bottom */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor={colors.gray}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleComment}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  (submitting || !newComment.trim()) && styles.submitButtonDisabled
                ]}
                onPress={handleComment}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={newComment.trim() ? colors.white : colors.gray} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
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
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
    marginLeft: 10,
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
  mainContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.white,
  },
  postContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    marginBottom: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  postTime: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 15,
    lineHeight: 24,
  },
  mediaContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  postImage: {
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  actionText: {
    fontSize: 16,
    color: colors.slateBlue,
    fontWeight: '500',
    marginLeft: 5,
  },
  commentsSection: {
    marginBottom: 20,
    paddingVertical: 15,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  noCommentsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  commentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    color: colors.darkGray,
    lineHeight: 22,
    marginBottom: 6,
  },
  commentTime: {
    fontSize: 13,
    color: colors.gray,
  },
  bottomSpacer: {
    height: 100,
  },
  commentInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
    color: colors.darkGray,
    backgroundColor: colors.white,
  },
  submitButton: {
    backgroundColor: colors.burntOrange,
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default PostDetailScreen; 