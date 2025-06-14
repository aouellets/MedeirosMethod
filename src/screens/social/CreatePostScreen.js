import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
// Using MockSocialService for MVP demo
import MockSocialService from '../../services/MockSocialService';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hashtags, setHashtags] = useState([]);
  const [exerciseName, setExerciseName] = useState('');

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setMediaFiles([...mediaFiles, result.assets[0]]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const extractHashtags = (text) => {
    const hashtagRegex = /#[\w-]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  };

  const handleContentChange = (text) => {
    setContent(text);
    setHashtags(extractHashtags(text));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please add some content to your post');
      return;
    }

    try {
      setIsSubmitting(true);
      const { success, error } = await MockSocialService.createPost(
        content,
        mediaFiles,
        null, // workoutId
        exerciseName || null,
        hashtags
      );

      if (success) {
        Alert.alert('Success', 'Your demo post has been created!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(error);
      }
    } catch (err) {
      console.error('Post creation error:', err);
      Alert.alert('Error', 'Failed to create post. This is a demo version.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.slateBlue, colors.burntOrange]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <View style={styles.headerRight}>
            <Text style={styles.demoLabel}>MVP DEMO</Text>
            <TouchableOpacity
              style={[styles.postButton, isSubmitting && styles.postButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || !content.trim()}
            >
              <Text style={styles.postButtonText}>
                {isSubmitting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.demoNotice}>
            <Ionicons name="information-circle" size={20} color={colors.burntOrange} />
            <Text style={styles.demoNoticeText}>
              This is a demo version. Your post will be added to the local mock feed.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind? Share your training progress, thoughts, or tips!"
              placeholderTextColor={colors.gray}
              multiline
              value={content}
              onChangeText={handleContentChange}
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {content.length}/500
            </Text>
          </View>

          <View style={styles.exerciseContainer}>
            <Text style={styles.sectionTitle}>Exercise (Optional)</Text>
            <TextInput
              style={styles.exerciseInput}
              placeholder="e.g., Squat, Deadlift, Running..."
              placeholderTextColor={colors.gray}
              value={exerciseName}
              onChangeText={setExerciseName}
              maxLength={50}
            />
          </View>

          {mediaFiles.length > 0 && (
            <View style={styles.mediaContainer}>
              <Text style={styles.sectionTitle}>Media Preview</Text>
              {mediaFiles.map((file, index) => (
                <View key={index} style={styles.mediaItem}>
                  <Image source={{ uri: file.uri }} style={styles.mediaPreview} />
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={() => removeMedia(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              <Text style={styles.sectionTitle}>Hashtags</Text>
              <View style={styles.hashtagsWrap}>
                {hashtags.map((tag, index) => (
                  <View key={index} style={styles.hashtag}>
                    <Text style={styles.hashtagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.mediaButton}
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={24} color={colors.white} />
            <Text style={styles.mediaButtonText}>Add Photo</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
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
  postButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  demoNoticeText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.darkGray,
    flex: 1,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    color: colors.darkGray,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'right',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
  },
  exerciseContainer: {
    marginBottom: 20,
  },
  exerciseInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.darkGray,
  },
  mediaContainer: {
    marginBottom: 20,
  },
  mediaItem: {
    position: 'relative',
    marginBottom: 10,
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  hashtagsContainer: {
    marginBottom: 20,
  },
  hashtagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hashtag: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  hashtagText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 10,
  },
  mediaButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
});

export default CreatePostScreen; 