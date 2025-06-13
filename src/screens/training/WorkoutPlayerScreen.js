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
  SafeAreaView,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { workoutService } from '../../services/workoutService';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const WorkoutPlayerScreen = ({ navigation, route }) => {
  const { workout } = route.params || {};
  
  // Core workout state
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState([]);
  
  // Timer and rest state
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  
  // Progress tracking
  const [workoutProgress, setWorkoutProgress] = useState(0);
  const [sessionData, setSessionData] = useState({
    exercises_completed: 0,
    sets_completed: 0,
    total_reps: 0,
  });
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const workoutTimerRef = useRef(null);

  // Hide navigation header
  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation])
  );

  // Initialize workout
  useEffect(() => {
    if (workout) {
      setWorkoutStartTime(Date.now());
      startWorkoutTimer();
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, [workout]);

  // Start workout timer
  const startWorkoutTimer = () => {
    workoutTimerRef.current = setInterval(() => {
      if (!isPaused) {
        setTotalWorkoutTime(prev => prev + 1);
      }
    }, 1000);
  };

  // Get current exercise data
  const getCurrentExercise = () => {
    if (!workout?.blocks?.[currentBlockIndex]?.block_exercises?.[currentExerciseIndex]) {
      return null;
    }
    return workout.blocks[currentBlockIndex].block_exercises[currentExerciseIndex];
  };

  const currentExercise = getCurrentExercise();

  // Calculate total progress
  const calculateProgress = () => {
    if (!workout?.blocks) return 0;
    
    let totalSets = 0;
    let completedSetsCount = 0;
    
    workout.blocks.forEach((block, blockIdx) => {
      block.block_exercises?.forEach((exercise, exIdx) => {
        totalSets += exercise.sets || 0;
        
        if (blockIdx < currentBlockIndex || 
           (blockIdx === currentBlockIndex && exIdx < currentExerciseIndex) ||
           (blockIdx === currentBlockIndex && exIdx === currentExerciseIndex && currentSet > 1)) {
          completedSetsCount += (blockIdx < currentBlockIndex || exIdx < currentExerciseIndex) 
            ? (exercise.sets || 0) 
            : (currentSet - 1);
        }
      });
    });
    
    return totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;
  };

  // Update progress animation
  useEffect(() => {
    const progress = calculateProgress();
    setWorkoutProgress(progress);
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentBlockIndex, currentExerciseIndex, currentSet]);

  // Handle set completion
  const handleCompleteSet = () => {
    if (!currentExercise) return;
    
    const setKey = `${currentBlockIndex}-${currentExerciseIndex}-${currentSet}`;
    setCompletedSets(prev => [...prev, setKey]);
    
    // Update session data
    setSessionData(prev => ({
      ...prev,
      sets_completed: prev.sets_completed + 1,
      total_reps: prev.total_reps + (currentExercise.reps || 0),
    }));
    
    // Vibration feedback
    Vibration.vibrate(100);
    
    if (currentSet < currentExercise.sets) {
      // Move to next set
      setCurrentSet(currentSet + 1);
      
      // Start rest timer if there's rest time
      if (currentExercise.rest_seconds && currentSet < currentExercise.sets) {
        startRestTimer(currentExercise.rest_seconds);
      }
    } else {
      // Exercise completed, move to next exercise
      handleCompleteExercise();
    }
  };

  // Handle exercise completion
  const handleCompleteExercise = () => {
    setSessionData(prev => ({
      ...prev,
      exercises_completed: prev.exercises_completed + 1,
    }));
    
    const currentBlock = workout.blocks[currentBlockIndex];
    
    if (currentExerciseIndex < currentBlock.block_exercises.length - 1) {
      // Move to next exercise in current block
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
    } else if (currentBlockIndex < workout.blocks.length - 1) {
      // Move to next block
      setCurrentBlockIndex(currentBlockIndex + 1);
      setCurrentExerciseIndex(0);
      setCurrentSet(1);
    } else {
      // Workout completed
      handleCompleteWorkout();
    }
  };

  // Handle workout completion
  const handleCompleteWorkout = async () => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
      
      const workoutData = {
        session_id: workout.id,
        duration_seconds: totalWorkoutTime,
        exercises_completed: sessionData.exercises_completed,
        sets_completed: sessionData.sets_completed,
        total_reps: sessionData.total_reps,
        completed_at: new Date().toISOString(),
      };
      
      await workoutService.completeWorkout(workout.id, workoutData);
      
      navigation.replace('WorkoutComplete', { 
        workout,
        sessionData: {
          ...sessionData,
          duration_seconds: totalWorkoutTime,
        }
      });
    } catch (error) {
      console.error('Error completing workout:', error);
      Alert.alert('Error', 'Failed to save workout completion. Please try again.');
    }
  };

  // Start rest timer
  const startRestTimer = (seconds) => {
    setIsResting(true);
    setRestTimeRemaining(seconds);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setRestTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsResting(false);
          Vibration.vibrate([100, 100, 100]); // Triple vibration for rest end
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Skip rest
  const handleSkipRest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsResting(false);
    setRestTimeRemaining(0);
  };

  // Pause/Resume workout
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    
    if (isResting && timerRef.current) {
      if (!isPaused) {
        clearInterval(timerRef.current);
      } else {
        startRestTimer(restTimeRemaining);
      }
    }
  };

  // Exit workout
  const handleExitWorkout = () => {
    Alert.alert(
      'Exit Workout',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          style: 'destructive', 
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
            navigation.goBack();
          }
        },
      ]
    );
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get set status
  const getSetStatus = (setNumber) => {
    const setKey = `${currentBlockIndex}-${currentExerciseIndex}-${setNumber}`;
    return completedSets.includes(setKey);
  };

  if (!currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading workout...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
        style={styles.gradient}
      >
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
          <TouchableOpacity style={styles.headerButton} onPress={handleExitWorkout}>
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Block {currentBlockIndex + 1} of {workout.blocks?.length || 0}
            </Text>
            <Text style={styles.headerSubtitle}>
              {formatTime(totalWorkoutTime)}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.headerButton} onPress={handlePauseResume}>
            <Ionicons
              name={isPaused ? 'play' : 'pause'}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {isResting ? (
            // Rest Screen
            <View style={styles.restContainer}>
              <View style={styles.restCard}>
                <Ionicons name="time-outline" size={48} color={colors.burntOrange} />
                <Text style={styles.restTitle}>Rest Time</Text>
                <Text style={styles.restTimer}>{formatTime(restTimeRemaining)}</Text>
                <Text style={styles.restSubtitle}>
                  Next: Set {currentSet} of {currentExercise.sets}
                </Text>
                
                <TouchableOpacity 
                  style={styles.skipRestButton}
                  onPress={handleSkipRest}
                >
                  <Text style={styles.skipRestText}>Skip Rest</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Exercise Screen
            <>
              {/* Exercise Info Card */}
              <View style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>
                    {currentExercise.exercises?.name || 'Exercise'}
                  </Text>
                  <View style={styles.exerciseBadge}>
                    <Text style={styles.exerciseBadgeText}>
                      {currentExerciseIndex + 1}/{workout.blocks[currentBlockIndex].block_exercises.length}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.exerciseDetails}>
                  {currentExercise.sets} sets × {currentExercise.reps} reps
                </Text>
                
                {currentExercise.notes && (
                  <Text style={styles.exerciseNotes}>{currentExercise.notes}</Text>
                )}
              </View>

              {/* Sets Tracker */}
              <View style={styles.setsCard}>
                <Text style={styles.setsTitle}>Set {currentSet} of {currentExercise.sets}</Text>
                
                <View style={styles.setsGrid}>
                  {Array.from({ length: currentExercise.sets }, (_, index) => {
                    const setNumber = index + 1;
                    const isCompleted = getSetStatus(setNumber);
                    const isCurrent = setNumber === currentSet;
                    
                    return (
                      <View
                        key={setNumber}
                        style={[
                          styles.setIndicator,
                          isCompleted && styles.setCompleted,
                          isCurrent && styles.setCurrent,
                        ]}
                      >
                        <Text
                          style={[
                            styles.setNumber,
                            isCompleted && styles.setNumberCompleted,
                            isCurrent && styles.setNumberCurrent,
                          ]}
                        >
                          {setNumber}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                
                <View style={styles.repsContainer}>
                  <Text style={styles.repsLabel}>Target Reps</Text>
                  <Text style={styles.repsValue}>{currentExercise.reps}</Text>
                </View>
              </View>

              {/* Exercise Demo Placeholder */}
              {currentExercise.exercises?.video_url && (
                <View style={styles.demoCard}>
                  <Ionicons name="play-circle-outline" size={48} color={colors.burntOrange} />
                  <Text style={styles.demoText}>Exercise Demonstration</Text>
                  <Text style={styles.demoSubtext}>Tap to view proper form</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Bottom Controls */}
        {!isResting && (
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                Alert.alert(
                  'Skip Set',
                  'Are you sure you want to skip this set?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Skip', onPress: handleCompleteSet },
                  ]
                );
              }}
            >
              <Text style={styles.secondaryButtonText}>Skip Set</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCompleteSet}
            >
              <LinearGradient
                colors={[colors.burntOrange, '#D35400']}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="checkmark" size={24} color={colors.white} />
                <Text style={styles.primaryButtonText}>
                  {currentSet === currentExercise.sets ? 'Complete Exercise' : 'Complete Set'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slateBlue,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  restContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  restCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginTop: 16,
    marginBottom: 20,
  },
  restTimer: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.burntOrange,
    marginBottom: 16,
  },
  restSubtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  skipRestButton: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  skipRestText: {
    color: colors.slateBlue,
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.slateBlue,
    flex: 1,
    marginRight: 12,
  },
  exerciseBadge: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  exerciseBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  exerciseDetails: {
    fontSize: 18,
    color: colors.burntOrange,
    fontWeight: '600',
    marginBottom: 12,
  },
  exerciseNotes: {
    fontSize: 16,
    color: colors.gray,
    lineHeight: 24,
  },
  setsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  setsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.slateBlue,
    textAlign: 'center',
    marginBottom: 20,
  },
  setsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  setIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  setCompleted: {
    backgroundColor: colors.green,
  },
  setCurrent: {
    borderColor: colors.burntOrange,
    backgroundColor: colors.lightOrange,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray,
  },
  setNumberCompleted: {
    color: colors.white,
  },
  setNumberCurrent: {
    color: colors.burntOrange,
  },
  repsContainer: {
    alignItems: 'center',
  },
  repsLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  repsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  demoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  demoText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.slateBlue,
    marginTop: 12,
  },
  demoSubtext: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  bottomControls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 15,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default WorkoutPlayerScreen; 