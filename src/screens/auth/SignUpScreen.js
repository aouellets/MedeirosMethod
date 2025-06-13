import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import TrackSelectorScreen from '../training/TrackSelectorScreen';
import { workoutService } from '../../services/workoutService';

const SignUpScreen = ({ navigation }) => {
  const { signUp, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    profilePhoto: null,
    
    // Personal Details
    dateOfBirth: '',
    gender: '',
    location: '',
    
    // Fitness Info
    fitnessLevel: 'beginner',
    trainingGoals: [],
    preferredWorkoutDays: [],
    preferredWorkoutTime: 'morning',
    equipmentAccess: 'gym',
    injuryHistory: '',
    
    // Preferences
    unitsPreference: 'metric',
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    trainingReminders: true,
    selectedTrackIds: [],
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [trackOptions, setTrackOptions] = useState([]);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState(null);

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData({ ...formData, profilePhoto: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.fitnessLevel) {
      newErrors.fitnessLevel = 'Please select your fitness level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.selectedTrackIds || formData.selectedTrackIds.length === 0) {
      newErrors.selectedTrackIds = 'Please select at least one track';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setErrors({});
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setErrors({});
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setErrors({});
      setCurrentStep(4);
    } else if (currentStep === 4 && validateStep4()) {
      setErrors({});
      setCurrentStep(5);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleTrainingGoal = (goal) => {
    const goals = formData.trainingGoals.includes(goal)
      ? formData.trainingGoals.filter(g => g !== goal)
      : [...formData.trainingGoals, goal];
    setFormData({ ...formData, trainingGoals: goals });
  };

  const toggleWorkoutDay = (day) => {
    const days = formData.preferredWorkoutDays.includes(day)
      ? formData.preferredWorkoutDays.filter(d => d !== day)
      : [...formData.preferredWorkoutDays, day];
    setFormData({ ...formData, preferredWorkoutDays: days });
  };

  const handleTrackToggle = (trackId) => {
    setFormData((prev) => {
      const ids = prev.selectedTrackIds.includes(trackId)
        ? prev.selectedTrackIds.filter(id => id !== trackId)
        : [...prev.selectedTrackIds, trackId];
      return { ...prev, selectedTrackIds: ids };
    });
  };

  const handleSignUp = async () => {  
    const profileData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      date_of_birth: formData.dateOfBirth,
      gender: formData.gender,
      location: formData.location,
      fitness_level: formData.fitnessLevel,
      training_goals: formData.trainingGoals,
      preferred_workout_days: formData.preferredWorkoutDays,
      preferred_workout_time: formData.preferredWorkoutTime,
      equipment_access: formData.equipmentAccess,
      injury_history: formData.injuryHistory,
      units_preference: formData.unitsPreference,
      notifications_enabled: formData.notificationsEnabled,
      email_notifications: formData.emailNotifications,
      push_notifications: formData.pushNotifications,
      training_reminders: formData.trainingReminders,
      profile_photo: formData.profilePhoto,
    };

    const result = await signUp(formData.email, formData.password, profileData);
    
    if (result.success) {
      // Subscribe to selected tracks
      for (const trackId of formData.selectedTrackIds) {
        try {
          await workoutService.subscribeToWorkoutTrack(trackId);
        } catch (e) {
          // Optionally handle error
        }
      }
      if (result.needsConfirmation) {
        Alert.alert(
          'Check Your Email',
          result.message || 'Please check your email to confirm your account',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        navigation.navigate('Confirmation');
      }
    } else {
      Alert.alert('Sign Up Failed', result.error || 'Something went wrong');
    }
  };

  const loadTracksForSignUp = async () => {
    setTrackLoading(true);
    try {
      const tracks = await workoutService.getWorkoutTracks();
      setTrackOptions(tracks);
    } catch (err) {
      setTrackError('Failed to load tracks');
    } finally {
      setTrackLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 4 && trackOptions.length === 0) {
      loadTracksForSignUp();
    }
  }, [currentStep]);

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      
      <TextInput
        style={[styles.input, errors.firstName && styles.inputError]}
        placeholder="First Name"
        placeholderTextColor={colors.gray}
        value={formData.firstName}
        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        textContentType="givenName"
        autoComplete="given-name"
        autoCapitalize="words"
      />
      {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      
      <TextInput
        style={[styles.input, errors.lastName && styles.inputError]}
        placeholder="Last Name"
        placeholderTextColor={colors.gray}
        value={formData.lastName}
        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        textContentType="familyName"
        autoComplete="family-name"
        autoCapitalize="words"
      />
      {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Email Address"
        placeholderTextColor={colors.gray}
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text.trim().toLowerCase() })}
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="emailAddress"
        autoComplete="email"
        autoCorrect={false}
        spellCheck={false}
        importantForAutofill="yes"
        autoFocus={false}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      
      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Password"
        placeholderTextColor={colors.gray}
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
        textContentType="newPassword"
        autoComplete="password-new"
        passwordRules="minlength: 8; required: lower; required: upper; required: digit;"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      
      {/* Profile Photo (Optional) */}
      <View style={styles.profilePhotoContainer}>
        <Text style={styles.inputLabel}>Profile Photo (Optional)</Text>
        <TouchableOpacity 
          style={styles.profilePhotoButton}
          onPress={handleImagePicker}
        >
          {formData.profilePhoto ? (
            <Image source={{ uri: formData.profilePhoto }} style={styles.profilePhotoPreview} />
          ) : (
            <View style={styles.profilePhotoPlaceholder}>
              <Text style={styles.profilePhotoText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Details</Text>
      
      {/* Date of Birth */}
      <TouchableOpacity 
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[styles.datePickerText, !formData.dateOfBirth && styles.placeholderText]}>
          {formData.dateOfBirth ? formData.dateOfBirth : 'Select Date of Birth'}
        </Text>
      </TouchableOpacity>
      
      {showDatePicker && Platform.OS === 'ios' && (
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.datePickerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.datePickerButton, styles.datePickerDoneButton]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={[styles.datePickerButtonText, styles.datePickerDoneButtonText]}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={formData.dateOfBirth ? new Date(formData.dateOfBirth + 'T12:00:00') : new Date(2000, 0, 1, 12, 0, 0)}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (selectedDate && event.type !== 'dismissed') {
                // Use local date methods to avoid timezone issues
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${day}`;
                setFormData({ ...formData, dateOfBirth: dateString });
              }
            }}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        </View>
      )}
      
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={formData.dateOfBirth ? new Date(formData.dateOfBirth + 'T12:00:00') : new Date(2000, 0, 1, 12, 0, 0)}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate && event.type !== 'dismissed') {
              // Use local date methods to avoid timezone issues
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const dateString = `${year}-${month}-${day}`;
              setFormData({ ...formData, dateOfBirth: dateString });
            }
          }}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
      
      {/* Gender Selector */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Gender</Text>
        <View style={styles.genderContainer}>
          {[
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
            { label: 'Prefer not to say', value: 'prefer_not_to_say' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.genderOption,
                formData.gender === option.value && styles.genderOptionSelected
              ]}
              onPress={() => setFormData({ ...formData, gender: option.value })}
            >
              <Text style={[
                styles.genderOptionText,
                formData.gender === option.value && styles.genderOptionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Location (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="City, Country (e.g., San Francisco, USA)"
          placeholderTextColor={colors.gray}
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
          textContentType="addressCity"
          autoComplete="off"
          autoCapitalize="words"
          returnKeyType="next"
          enablesReturnKeyAutomatically={false}
          autoCorrect={false}
          spellCheck={false}
          clearButtonMode="while-editing"
        />
      </View>
      
      {/* Fitness Level */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Fitness Level</Text>
        <View style={styles.fitnessLevelContainer}>
          {[
            { label: 'Beginner', value: 'beginner', description: 'New to fitness' },
            { label: 'Intermediate', value: 'intermediate', description: 'Some experience' },
            { label: 'Advanced', value: 'advanced', description: 'Regular training' },
            { label: 'Elite', value: 'elite', description: 'Competitive level' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.fitnessOption,
                formData.fitnessLevel === option.value && styles.fitnessOptionSelected
              ]}
              onPress={() => setFormData({ ...formData, fitnessLevel: option.value })}
            >
              <Text style={[
                styles.fitnessOptionTitle,
                formData.fitnessLevel === option.value && styles.fitnessOptionTitleSelected
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.fitnessOptionDescription,
                formData.fitnessLevel === option.value && styles.fitnessOptionDescriptionSelected
              ]}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.fitnessLevel && <Text style={styles.errorText}>{errors.fitnessLevel}</Text>}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Training Preferences</Text>
      
      <Text style={styles.sectionLabel}>Training Goals (Select all that apply)</Text>
      <View style={styles.checkboxContainer}>
        {['strength', 'endurance', 'weight_loss', 'muscle_gain', 'general_fitness', 'competition'].map(goal => (
          <TouchableOpacity
            key={goal}
            style={[styles.checkbox, formData.trainingGoals.includes(goal) && styles.checkboxSelected]}
            onPress={() => toggleTrainingGoal(goal)}
          >
            <Text style={[styles.checkboxText, formData.trainingGoals.includes(goal) && styles.checkboxTextSelected]}>
              {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.sectionLabel}>Preferred Workout Days</Text>
      <View style={styles.checkboxContainer}>
        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
          <TouchableOpacity
            key={day}
            style={[styles.checkbox, formData.preferredWorkoutDays.includes(day) && styles.checkboxSelected]}
            onPress={() => toggleWorkoutDay(day)}
          >
            <Text style={[styles.checkboxText, formData.preferredWorkoutDays.includes(day) && styles.checkboxTextSelected]}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Preferred Workout Time */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Preferred Workout Time</Text>
        <View style={styles.timeContainer}>
          {[
            { label: '🌅 Morning', value: 'morning' },
            { label: '☀️ Afternoon', value: 'afternoon' },
            { label: '🌆 Evening', value: 'evening' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timeOption,
                formData.preferredWorkoutTime === option.value && styles.timeOptionSelected
              ]}
              onPress={() => setFormData({ ...formData, preferredWorkoutTime: option.value })}
            >
              <Text style={[
                styles.timeOptionText,
                formData.preferredWorkoutTime === option.value && styles.timeOptionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Equipment Access */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Equipment Access</Text>
        <View style={styles.equipmentContainer}>
          {[
            { label: '🏋️ Full Gym', value: 'gym', description: 'Access to complete gym equipment' },
            { label: '🏠 Home Gym', value: 'home_gym', description: 'Personal equipment at home' },
            { label: '🔧 Minimal Equipment', value: 'minimal', description: 'Basic equipment only' },
            { label: '💪 Bodyweight Only', value: 'bodyweight', description: 'No equipment needed' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.equipmentOption,
                formData.equipmentAccess === option.value && styles.equipmentOptionSelected
              ]}
              onPress={() => setFormData({ ...formData, equipmentAccess: option.value })}
            >
              <Text style={[
                styles.equipmentOptionTitle,
                formData.equipmentAccess === option.value && styles.equipmentOptionTitleSelected
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.equipmentOptionDescription,
                formData.equipmentAccess === option.value && styles.equipmentOptionDescriptionSelected
              ]}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Any injuries or limitations? (Optional)"
        placeholderTextColor={colors.gray}
        value={formData.injuryHistory}
        onChangeText={(text) => setFormData({ ...formData, injuryHistory: text })}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Your Training Tracks</Text>
      <Text style={styles.stepSubtitle}>Select one or more tracks to get started. You can change these later in your profile.</Text>
      {trackLoading ? (
        <ActivityIndicator size="large" color={colors.burntOrange} />
      ) : trackError ? (
        <Text style={styles.errorText}>{trackError}</Text>
      ) : (
        <ScrollView style={{ maxHeight: 350 }}>
          {trackOptions.map(track => {
            const isSelected = formData.selectedTrackIds.includes(track.id);
            return (
              <TouchableOpacity
                key={track.id}
                style={[styles.trackCard, isSelected && styles.selectedCard]}
                onPress={() => handleTrackToggle(track.id)}
                activeOpacity={0.8}
              >
                <View style={styles.trackHeader}>
                  <Text style={styles.trackEmoji}>{track.emoji}</Text>
                  <Text style={styles.trackName}>{track.name}</Text>
                  <Text style={styles.difficultyText}>Difficulty: {track.difficulty_level}/5</Text>
                </View>
                <Text style={styles.trackDescription}>{track.description}</Text>
                <View style={[styles.selectButton, isSelected && styles.selectedButton]}>
                  <Text style={styles.selectButtonText}>{isSelected ? 'Selected' : 'Tap to Select'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      {errors.selectedTrackIds && <Text style={styles.errorText}>{errors.selectedTrackIds}</Text>}
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.slateBlue, colors.burntOrange]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Join the Medeiros Method</Text>
          <Text style={styles.subtitle}>Step {currentStep} of 5</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 5) * 100}%` }]} />
          </View>
          
          <View style={styles.formContainer}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            
            <View style={styles.buttonContainer}>
              {currentStep > 1 && (
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              {currentStep < 5 ? (
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]} 
                  onPress={handleSignUp}
                  disabled={isLoading}
                >
                  <Text style={styles.signUpButtonText}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>Already have an account? Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.boneWhite,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.boneWhite,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 30,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.boneWhite,
    borderRadius: 2,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  stepContainer: {
    gap: 15,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 5,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginTop: 10,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  checkbox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  checkboxSelected: {
    backgroundColor: colors.slateBlue,
    borderColor: colors.slateBlue,
  },
  checkboxText: {
    fontSize: 14,
    color: colors.slateBlue,
  },
  checkboxTextSelected: {
    color: colors.boneWhite,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 15,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.slateBlue,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.slateBlue,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.boneWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    flex: 1,
    backgroundColor: colors.burntOrange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signUpButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  signUpButtonText: {
    color: colors.boneWhite,
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  loginLinkText: {
    color: colors.slateBlue,
    fontSize: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
  },
  datePickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    marginBottom: 12,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: colors.slateBlue,
    fontWeight: '600',
  },
  datePickerDoneButton: {
    backgroundColor: colors.slateBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 0,
  },
  datePickerDoneButtonText: {
    color: colors.white,
  },
  datePickerText: {
    fontSize: 16,
    color: colors.slateBlue,
  },
  placeholderText: {
    color: colors.gray,
  },
  sectionContainer: {
    gap: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  genderOptionSelected: {
    backgroundColor: colors.slateBlue,
    borderColor: colors.slateBlue,
  },
  genderOptionText: {
    fontSize: 14,
    color: colors.slateBlue,
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: colors.boneWhite,
  },
  fitnessLevelContainer: {
    gap: 8,
  },
  fitnessOption: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  fitnessOptionSelected: {
    backgroundColor: colors.slateBlue,
    borderColor: colors.slateBlue,
  },
  fitnessOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 2,
  },
  fitnessOptionTitleSelected: {
    color: colors.boneWhite,
  },
  fitnessOptionDescription: {
    fontSize: 12,
    color: colors.gray,
  },
  fitnessOptionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  timeOptionSelected: {
    backgroundColor: colors.slateBlue,
    borderColor: colors.slateBlue,
  },
  timeOptionText: {
    fontSize: 14,
    color: colors.slateBlue,
  },
  timeOptionTextSelected: {
    color: colors.boneWhite,
  },
  equipmentContainer: {
    gap: 8,
  },
  equipmentOption: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  equipmentOptionSelected: {
    backgroundColor: colors.slateBlue,
    borderColor: colors.slateBlue,
  },
  equipmentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 2,
  },
  equipmentOptionTitleSelected: {
    color: colors.boneWhite,
  },
  equipmentOptionDescription: {
    fontSize: 12,
    color: colors.gray,
  },
  equipmentOptionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profilePhotoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 8,
    textAlign: 'center',
  },
  profilePhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderStyle: 'dashed',
  },
  profilePhotoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profilePhotoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  profilePhotoText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  trackCard: {
    padding: 16,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 12,
    marginBottom: 10,
  },
  selectedCard: {
    borderColor: colors.slateBlue,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
  },
  difficultyText: {
    fontSize: 12,
    color: colors.gray,
  },
  trackDescription: {
    fontSize: 14,
    color: colors.gray,
  },
  selectButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: colors.slateBlue,
    borderColor: colors.slateBlue,
  },
  selectButtonText: {
    fontSize: 14,
    color: colors.boneWhite,
    fontWeight: '600',
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.boneWhite,
    marginBottom: 10,
  },
});

export default SignUpScreen; 