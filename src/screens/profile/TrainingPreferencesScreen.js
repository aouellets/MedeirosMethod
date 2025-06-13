import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Switch,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../../theme/colors';
import ProfileService from '../../services/profileService';

const TrainingPreferencesScreen = ({ navigation }) => {
  const [preferences, setPreferences] = useState({
    fitness_level: 'beginner',
    training_goals: [],
    preferred_workout_days: [],
    preferred_workout_time: 'morning',
    equipment_access: [],
    injury_history: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadPreferences();
    startAnimations();
  }, []);

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

  const loadPreferences = async () => {
    try {
      const { profile } = await ProfileService.getProfile();
      setPreferences({
        fitness_level: profile.fitness_level || 'beginner',
        training_goals: profile.training_goals || [],
        preferred_workout_days: profile.preferred_workout_days || [],
        preferred_workout_time: profile.preferred_workout_time || 'morning',
        equipment_access: profile.equipment_access || [],
        injury_history: profile.injury_history || '',
      });
    } catch (error) {
      console.error('Load preferences error:', error);
      Alert.alert('Error', 'Failed to load training preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await ProfileService.updateProfile(preferences);
      Alert.alert('Success', 'Training preferences updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Save preferences error:', error);
      Alert.alert('Error', 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (array, item) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    return newArray;
  };

  const trainingGoals = [
    'Weight Loss',
    'Muscle Gain',
    'Strength Building',
    'Endurance',
    'Flexibility',
    'General Fitness',
    'Athletic Performance',
    'Injury Recovery'
  ];

  const workoutDays = [
    'Monday',
    'Tuesday', 
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const equipment = [
    'Dumbbells',
    'Barbell',
    'Pull-up Bar',
    'Resistance Bands',
    'Kettlebells',
    'Exercise Ball',
    'Yoga Mat',
    'Full Gym Access',
    'Home Gym',
    'No Equipment'
  ];

  const CheckboxItem = ({ label, checked, onToggle }) => (
    <TouchableOpacity style={styles.checkboxItem} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <Text style={styles.loadingText}>Loading preferences...</Text>
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
            <Text style={styles.title}>Training Preferences</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={saving}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          {/* Fitness Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fitness Level</Text>
            <Text style={styles.sectionDescription}>
              Select your current fitness level to get appropriate workouts
            </Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={preferences.fitness_level}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, fitness_level: value }))}
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

          {/* Training Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Training Goals</Text>
            <Text style={styles.sectionDescription}>
              What do you want to achieve? (Select multiple)
            </Text>
            
            <View style={styles.checkboxGrid}>
              {trainingGoals.map((goal) => (
                <CheckboxItem
                  key={goal}
                  label={goal}
                  checked={preferences.training_goals.includes(goal)}
                  onToggle={() => setPreferences(prev => ({
                    ...prev,
                    training_goals: toggleArrayItem(prev.training_goals, goal)
                  }))}
                />
              ))}
            </View>
          </View>

          {/* Preferred Workout Days */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferred Workout Days</Text>
            <Text style={styles.sectionDescription}>
              Which days work best for your training schedule?
            </Text>
            
            <View style={styles.checkboxGrid}>
              {workoutDays.map((day) => (
                <CheckboxItem
                  key={day}
                  label={day}
                  checked={preferences.preferred_workout_days.includes(day)}
                  onToggle={() => setPreferences(prev => ({
                    ...prev,
                    preferred_workout_days: toggleArrayItem(prev.preferred_workout_days, day)
                  }))}
                />
              ))}
            </View>
          </View>

          {/* Preferred Workout Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferred Workout Time</Text>
            <Text style={styles.sectionDescription}>
              When do you usually prefer to work out?
            </Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={preferences.preferred_workout_time}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, preferred_workout_time: value }))}
                style={styles.picker}
                dropdownIconColor={colors.white}
              >
                <Picker.Item label="Morning (6-10 AM)" value="morning" />
                <Picker.Item label="Afternoon (12-5 PM)" value="afternoon" />
                <Picker.Item label="Evening (6-10 PM)" value="evening" />
              </Picker>
            </View>
          </View>

          {/* Equipment Access */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Equipment</Text>
            <Text style={styles.sectionDescription}>
              What equipment do you have access to?
            </Text>
            
            <View style={styles.checkboxGrid}>
              {equipment.map((item) => (
                <CheckboxItem
                  key={item}
                  label={item}
                  checked={preferences.equipment_access.includes(item)}
                  onToggle={() => setPreferences(prev => ({
                    ...prev,
                    equipment_access: toggleArrayItem(prev.equipment_access, item)
                  }))}
                />
              ))}
            </View>
          </View>

          {/* Injury History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Injury History & Limitations</Text>
            <Text style={styles.sectionDescription}>
              Tell us about any injuries or physical limitations (optional)
            </Text>
            
            <TextInput
              style={styles.textArea}
              value={preferences.injury_history}
              onChangeText={(text) => setPreferences(prev => ({ ...prev, injury_history: text }))}
              placeholder="Describe any injuries, limitations, or areas to avoid..."
              placeholderTextColor={colors.lightGray}
              multiline
              numberOfLines={4}
            />
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.lightGray,
    marginBottom: 20,
    lineHeight: 20,
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
  checkboxGrid: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.lightGray,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.burntOrange,
    borderColor: colors.burntOrange,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
    flex: 1,
  },
  textArea: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.white,
    height: 100,
    textAlignVertical: 'top',
  },
});

export default TrainingPreferencesScreen; 