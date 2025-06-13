import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';
import { useProfile } from '../../hooks/useProfile';

const { width, height } = Dimensions.get('window');

const EditProfileScreen = ({ navigation }) => {
  const {
    profile: profileData,
    loading: profileLoading,
    updating,
    updateProfile,
    uploadProfilePhoto,
    deleteProfilePhoto,
  } = useProfile();
  
  const [profile, setProfile] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (profileData) {
      setProfile({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        date_of_birth: profileData.date_of_birth ? new Date(profileData.date_of_birth) : null,
        gender: profileData.gender || '',
        height_cm: profileData.height_cm?.toString() || '',
        weight_kg: profileData.weight_kg?.toString() || '',
        fitness_level: profileData.fitness_level || 'beginner',
        units_preference: profileData.units_preference || 'metric',
        profile_photo_url: profileData.profile_photo_url || null,
      });
    }
    startAnimations();
  }, [profileData]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = async () => {
    try {
      const updateData = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        full_name: `${profile.first_name} ${profile.last_name}`.trim() || profile.first_name,
        bio: profile.bio,
        location: profile.location,
        date_of_birth: profile.date_of_birth ? profile.date_of_birth.toISOString().split('T')[0] : null,
        gender: profile.gender,
        height_cm: profile.height_cm ? parseInt(profile.height_cm) : null,
        weight_kg: profile.weight_kg ? parseFloat(profile.weight_kg) : null,
        fitness_level: profile.fitness_level,
        units_preference: profile.units_preference,
      };

      const result = await updateProfile(updateData);
      
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const uploadResult = await uploadProfilePhoto(result.assets[0].uri);
        
        if (uploadResult.success) {
          setProfile(prev => ({ ...prev, profile_photo_url: uploadResult.photoUrl }));
          Alert.alert('Success', 'Profile photo updated successfully');
        } else {
          Alert.alert('Error', uploadResult.error || 'Failed to upload image');
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleRemovePhoto = async () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteProfilePhoto();
              
              if (result.success) {
                setProfile(prev => ({ ...prev, profile_photo_url: null }));
                Alert.alert('Success', 'Profile photo removed successfully');
              } else {
                Alert.alert('Error', result.error || 'Failed to remove photo');
              }
            } catch (error) {
              console.error('Remove photo error:', error);
              Alert.alert('Error', 'Failed to remove photo');
            }
          },
        },
      ]
    );
  };

  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <ActivityIndicator size="large" color={colors.white} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={updating}>
              <Text style={styles.saveButtonText}>{updating ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profile.profile_photo_url ? (
                <Image source={{ uri: profile.profile_photo_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>📷</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleImagePicker} style={styles.changePhotoButton} disabled={updating}>
              <Text style={styles.changePhotoText}>{updating ? 'Uploading...' : 'Change Photo'}</Text>
            </TouchableOpacity>
            {profile.profile_photo_url && (
              <TouchableOpacity onPress={handleRemovePhoto} style={styles.removePhotoButton} disabled={updating}>
                <Text style={styles.removePhotoText}>Remove Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={profile.first_name}
                onChangeText={(text) => setProfile(prev => ({ ...prev, first_name: text }))}
                placeholder="Enter your first name"
                placeholderTextColor={colors.lightGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={profile.last_name}
                onChangeText={(text) => setProfile(prev => ({ ...prev, last_name: text }))}
                placeholder="Enter your last name"
                placeholderTextColor={colors.lightGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={profile.email}
                editable={false}
                placeholder="Email address"
                placeholderTextColor={colors.lightGray}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile.bio}
                onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself"
                placeholderTextColor={colors.lightGray}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={profile.location}
                onChangeText={(text) => setProfile(prev => ({ ...prev, location: text }))}
                placeholder="City, Country"
                placeholderTextColor={colors.lightGray}
              />
            </View>
          </View>

          {/* Personal Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {profile.date_of_birth 
                    ? profile.date_of_birth.toLocaleDateString()
                    : 'Select date of birth'
                  }
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={profile.date_of_birth || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setProfile(prev => ({ ...prev, date_of_birth: selectedDate }));
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={profile.gender}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}
                  style={styles.picker}
                  dropdownIconColor={colors.white}
                >
                  <Picker.Item label="Select gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                  <Picker.Item label="Prefer not to say" value="prefer_not_to_say" />
                </Picker>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  Height ({profile.units_preference === 'metric' ? 'cm' : 'ft'})
                </Text>
                <TextInput
                  style={styles.input}
                  value={profile.height_cm}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, height_cm: text }))}
                  placeholder="170"
                  placeholderTextColor={colors.lightGray}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  Weight ({profile.units_preference === 'metric' ? 'kg' : 'lbs'})
                </Text>
                <TextInput
                  style={styles.input}
                  value={profile.weight_kg}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, weight_kg: text }))}
                  placeholder="70"
                  placeholderTextColor={colors.lightGray}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Fitness Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fitness Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fitness Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={profile.fitness_level}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, fitness_level: value }))}
                  style={styles.picker}
                  dropdownIconColor={colors.white}
                >
                  <Picker.Item label="Beginner" value="beginner" />
                  <Picker.Item label="Intermediate" value="intermediate" />
                  <Picker.Item label="Advanced" value="advanced" />
                  <Picker.Item label="Elite" value="elite" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Units Preference</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={profile.units_preference}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, units_preference: value }))}
                  style={styles.picker}
                  dropdownIconColor={colors.white}
                >
                  <Picker.Item label="Metric (kg, cm)" value="metric" />
                  <Picker.Item label="Imperial (lbs, ft)" value="imperial" />
                </Picker>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slateBlue,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.slateBlue,
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  saveButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.burntOrange,
    marginBottom: 15,
  },
  avatar: {
    width: 114,
    height: 114,
    borderRadius: 57,
  },
  avatarPlaceholder: {
    width: 114,
    height: 114,
    borderRadius: 57,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 40,
  },
  changePhotoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 10,
  },
  changePhotoText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  removePhotoButton: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  removePhotoText: {
    color: colors.red,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.lightGray,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.white,
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: colors.lightGray,
    marginTop: 5,
    opacity: 0.7,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.white,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  picker: {
    color: colors.white,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
});

export default EditProfileScreen; 