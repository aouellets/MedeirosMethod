import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { workoutService } from '../../services/workoutService';

const { width, height } = Dimensions.get('window');

const WorkoutPlayerScreen = ({ navigation, route }) => {
  const { workout } = route.params || {};
  const [currentBlock, setCurrentBlock] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutProgress, setWorkoutProgress] = useState(0);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (workout?.blocks?.[currentBlock]?.exercises?.[currentExercise]) {
      const exercise = workout.blocks[currentBlock].exercises[currentExercise];
      if (exercise.rest_time) {
        setRestTimeRemaining(exercise.rest_time);
        setIsResting(true);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentBlock, currentExercise]);

  const handleCompleteExercise = () => {
    const currentBlockExercises = workout.blocks[currentBlock].exercises;
    
    if (currentExercise < currentBlockExercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else if (currentBlock < workout.blocks.length - 1) {
      setCurrentBlock(currentBlock + 1);
      setCurrentExercise(0);
    } else {
      handleCompleteWorkout();
    }
    
    // Update progress
    const totalExercises = workout.blocks.reduce((acc, block) => acc + block.exercises.length, 0);
    const completedExercises = workout.blocks
      .slice(0, currentBlock)
      .reduce((acc, block) => acc + block.exercises.length, 0) + currentExercise + 1;
    
    const newProgress = (completedExercises / totalExercises) * 100;
    setWorkoutProgress(newProgress);
    
    Animated.timing(progressAnim, {
      toValue: newProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleCompleteWorkout = async () => {
    try {
      await workoutService.completeWorkout(workout.id);
      navigation.replace('WorkoutComplete', { workout });
    } catch (error) {
      console.error('Error completing workout:', error);
      Alert.alert('Error', 'Failed to save workout completion. Please try again.');
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (isResting && timerRef.current) {
      if (isPaused) {
        startRestTimer();
      } else {
        clearInterval(timerRef.current);
      }
    }
  };

  const startRestTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setRestTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExerciseData = workout?.blocks?.[currentBlock]?.exercises?.[currentExercise];

  if (!currentExerciseData) {
    return (
      <View style={styles.container}>
        <Text>Loading workout...</Text>
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

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              'Exit Workout',
              'Are you sure you want to exit? Your progress will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
              ]
            );
          }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Block {currentBlock + 1} of {workout.blocks.length}
        </Text>
        <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={24}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isResting ? (
          <View style={styles.restContainer}>
            <Text style={styles.restTitle}>Rest Time</Text>
            <Text style={styles.restTimer}>{formatTime(restTimeRemaining)}</Text>
            <Text style={styles.restSubtitle}>Get ready for the next exercise</Text>
          </View>
        ) : (
          <>
            <View style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{currentExerciseData.name}</Text>
              <Text style={styles.exerciseSets}>
                {currentExerciseData.sets} sets × {currentExerciseData.reps} reps
              </Text>
              {currentExerciseData.notes && (
                <Text style={styles.exerciseNotes}>{currentExerciseData.notes}</Text>
              )}
            </View>

            {currentExerciseData.demonstration_video && (
              <View style={styles.videoContainer}>
                {/* Video player would go here */}
                <Text style={styles.videoPlaceholder}>Exercise Demonstration</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.skipButton]}
          onPress={() => {
            Alert.alert(
              'Skip Exercise',
              'Are you sure you want to skip this exercise?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Skip', onPress: handleCompleteExercise },
              ]
            );
          }}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.completeButton]}
          onPress={handleCompleteExercise}
        >
          <Text style={styles.completeButtonText}>
            {currentBlock === workout.blocks.length - 1 &&
            currentExercise === workout.blocks[currentBlock].exercises.length - 1
              ? 'Complete Workout'
              : 'Complete Exercise'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.boneWhite,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.4,
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.white + '40',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.burntOrange,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    height: 80,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  pauseButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  restContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
  },
  restTimer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
  },
  restSubtitle: {
    fontSize: 18,
    color: colors.white + 'CC',
  },
  exerciseCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 10,
  },
  exerciseSets: {
    fontSize: 18,
    color: colors.burntOrange,
    fontWeight: '600',
    marginBottom: 10,
  },
  exerciseNotes: {
    fontSize: 16,
    color: colors.gray,
    lineHeight: 24,
  },
  videoContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  videoPlaceholder: {
    fontSize: 16,
    color: colors.gray,
  },
  bottomControls: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  skipButton: {
    backgroundColor: colors.lightGray,
  },
  completeButton: {
    backgroundColor: colors.burntOrange,
  },
  skipButtonText: {
    color: colors.gray,
    fontSize: 16,
    fontWeight: '600',
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkoutPlayerScreen; 