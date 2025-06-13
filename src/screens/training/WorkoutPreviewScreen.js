import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatSessionName, formatSessionType } from '../../utils/formatting';

const WorkoutPreviewScreen = ({ navigation, route }) => {
  const { workout } = route.params || {};
  
  const [workoutData, setWorkoutData] = useState({
    name: '',
    session_type: '',
    duration_minutes: 0,
    intensity_level: 0,
    blocks: [],
    equipment_needed: [],
  });

  useEffect(() => {
    if (workout) {
      setWorkoutData(workout);
    }
  }, [workout]);

  const handleStartWorkout = () => {
    navigation.navigate('WorkoutPlayer', { workout: workoutData });
  };

  const renderEquipmentList = () => {
    if (!workoutData.equipment_needed?.length) {
      return (
        <Text style={styles.noEquipmentText}>
          No special equipment needed for this workout
        </Text>
      );
    }

    return workoutData.equipment_needed.map((equipment, index) => (
      <View key={index} style={styles.equipmentItem}>
        <Ionicons name="fitness-outline" size={20} color="#fff" />
        <Text style={styles.equipmentText}>{equipment}</Text>
      </View>
    ));
  };

  const renderBlocks = () => {
    if (!workoutData.blocks?.length) {
      return (
        <Text style={styles.noBlocksText}>
          No workout blocks available
        </Text>
      );
    }

    return workoutData.blocks.map((block, index) => (
      <View key={index} style={styles.blockContainer}>
        <Text style={styles.blockName}>{block.name}</Text>
        {block.exercises?.map((exercise, exIndex) => (
          <View key={exIndex} style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseDetails}>
              {exercise.sets} sets × {exercise.reps} reps
            </Text>
            {exercise.notes && (
              <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
            )}
          </View>
        ))}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>{workoutData.name}</Text>
            <Text style={styles.subtitle}>
              {formatSessionType(workoutData.session_type)}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={24} color="#fff" />
              <Text style={styles.statValue}>{workoutData.duration_minutes} min</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={24} color="#fff" />
              <Text style={styles.statValue}>{workoutData.intensity_level}/10</Text>
              <Text style={styles.statLabel}>Intensity</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment Needed</Text>
            {renderEquipmentList()}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Structure</Text>
            {renderBlocks()}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  equipmentText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 16,
  },
  noEquipmentText: {
    color: '#888',
    fontStyle: 'italic',
  },
  blockContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  blockName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  exerciseItem: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#888',
  },
  exerciseNotes: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  noBlocksText: {
    color: '#888',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  startButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WorkoutPreviewScreen; 