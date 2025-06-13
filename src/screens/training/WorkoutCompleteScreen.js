import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { workoutService } from '../../services/workoutService';
import { formatSessionName } from '../../utils/formatting';

const { width, height } = Dimensions.get('window');

const WorkoutCompleteScreen = ({ navigation, route }) => {
  const { workout, workoutData, sessionData } = route.params || {};
  
  // Use sessionData if available, otherwise workoutData
  const actualWorkoutData = sessionData || workoutData;
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalExercises: 0,
    totalBlocks: 0,
    duration: 0, // in seconds
    scores: [], // Array of scored blocks/exercises
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // If no workout data, navigate back
  useEffect(() => {
    if (!workout) {
      Alert.alert('Error', 'No workout data found', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [workout, navigation]);

  useEffect(() => {
    calculateStats();
    startAnimations();
  }, []);

  useEffect(() => {
    if (stats.totalExercises > 0) {
      loadAchievements();
    }
  }, [stats]);

  const startAnimations = () => {
    // Stagger the animations for a nice effect
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const calculateStats = () => {
    // Use actualWorkoutData if available (from actual workout completion), otherwise estimate from workout structure
    if (actualWorkoutData) {
      // Calculate scores from actual workout data if available
      const scores = actualWorkoutData.scores || [];
      
      setStats({
        totalExercises: actualWorkoutData.exercises_completed || 0,
        totalBlocks: actualWorkoutData.blocks_completed || 0,
        duration: actualWorkoutData.duration_seconds || 0,
        scores: scores,
      });
      return;
    }

    if (!workout?.blocks) {
      // If no workout data at all, set defaults
      setStats({
        totalExercises: 0,
        totalBlocks: 0,
        duration: 0,
        scores: [],
      });
      return;
    }

    // Calculate from workout structure
    let totalExercises = 0;
    const scores = [];

    workout.blocks.forEach((block, blockIndex) => {
      const exercises = block.exercises || block.block_exercises || [];
      
      if (Array.isArray(exercises)) {
        exercises.forEach((exercise, exerciseIndex) => {
          if (exercise) {
            totalExercises++;
            
            // Check if this exercise has scoring (user-entered reps or performance metrics)
            if (exercise.is_scored || exercise.track_reps || exercise.track_performance) {
              scores.push({
                blockName: block.name || `Block ${blockIndex + 1}`,
                exerciseName: exercise.exercises?.name || exercise.name || `Exercise ${exerciseIndex + 1}`,
                targetReps: exercise.reps || 0,
                actualReps: exercise.actual_reps || exercise.reps || 0, // Use actual if available
                score: exercise.score || null,
                type: exercise.session_type || 'performance'
              });
            }
          }
        });
      }
    });

    setStats({
      totalExercises,
      totalBlocks: workout.blocks.length,
      duration: workout.duration_minutes ? workout.duration_minutes * 60 : 0,
      scores: scores,
    });
  };

  const loadAchievements = async () => {
    try {
      // For now, we'll create mock achievements since the table doesn't exist
      // TODO: Implement proper achievements system later
      const mockAchievements = [];
      
      // Add some conditional achievements based on workout completion
      if (stats.totalExercises >= 8) {
        mockAchievements.push({
          icon: 'trophy',
          title: 'Exercise Champion',
          description: 'Completed 8+ exercises in one workout!'
        });
      }
      
      if (stats.totalBlocks >= 3) {
        mockAchievements.push({
          icon: 'grid',
          title: 'Block Crusher',
          description: 'Conquered 3+ training blocks!'
        });
      }
      
      if (stats.duration >= 1800) { // 30 minutes
        mockAchievements.push({
          icon: 'time',
          title: 'Endurance Warrior',
          description: 'Trained for 30+ minutes straight!'
        });
      }
      
              if (stats.scores && stats.scores.length >= 3) {
        mockAchievements.push({
          icon: 'analytics',
          title: 'Performance Tracker',
          description: 'Scored performance on 3+ exercises!'
        });
      }
      
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      setAchievements([]);
    }
  };

  const handleShare = () => {
    // Implement social sharing functionality
    Alert.alert('Coming Soon', 'Social sharing will be available in the next update!');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeContainer}>
        <Animated.View style={[styles.decorativeCircle1, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.decorativeCircle2, { opacity: fadeAnim }]} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Success Message */}
        <Animated.View 
          style={[
            styles.successContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={50} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Workout Complete!</Text>
          <Text style={styles.successSubtitle}>
            Amazing work completing {formatSessionName(workout?.name || 'your workout')}
          </Text>
          {actualWorkoutData?.duration_seconds && (
            <Text style={styles.durationText}>
              Total time: {Math.floor(actualWorkoutData.duration_seconds / 60)}:{(actualWorkoutData.duration_seconds % 60).toString().padStart(2, '0')}
            </Text>
          )}
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View 
          style={[
            styles.statsGrid,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="fitness" size={24} color={colors.burntOrange} />
            </View>
            <Text style={styles.statValue}>{stats.totalExercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="grid" size={24} color={colors.burntOrange} />
            </View>
            <Text style={styles.statValue}>{stats.totalBlocks}</Text>
            <Text style={styles.statLabel}>Blocks</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time" size={24} color={colors.burntOrange} />
            </View>
            <Text style={styles.statValue}>
              {stats.duration > 0 
                ? `${Math.floor(stats.duration / 60)}:${(stats.duration % 60).toString().padStart(2, '0')}`
                : '0:00'
              }
            </Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          {stats.scores && stats.scores.length > 0 && (
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trophy" size={24} color={colors.burntOrange} />
              </View>
              <Text style={styles.statValue}>{stats.scores.length}</Text>
              <Text style={styles.statLabel}>Scored</Text>
            </View>
          )}
        </Animated.View>

        {/* Scores Section */}
        {stats.scores && stats.scores.length > 0 && (
          <Animated.View 
            style={[
              styles.scoresSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.sectionTitle}>📊 Performance Scores</Text>
            {stats.scores.map((score, index) => (
              <View key={index} style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <Text style={styles.scoreBlockName}>{score.blockName}</Text>
                  <View style={styles.scoreValueContainer}>
                    {score.score ? (
                      <Text style={styles.scoreValue}>{score.score}</Text>
                    ) : (
                      <Text style={styles.scoreReps}>{score.actualReps}/{score.targetReps}</Text>
                    )}
                  </View>
                </View>
                <Text style={styles.scoreExerciseName}>{score.exerciseName}</Text>
                {score.type && (
                  <Text style={styles.scoreType}>{score.type.toUpperCase()}</Text>
                )}
              </View>
            ))}
          </Animated.View>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <Animated.View 
            style={[
              styles.achievementsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.sectionTitle}>🏆 Achievements Unlocked</Text>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Ionicons name={achievement.icon} size={28} color={colors.burntOrange} />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Motivational Quote */}
        <Animated.View 
          style={[
            styles.quoteSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.quoteText}>
            "The only bad workout is the one that didn't happen."
          </Text>
          <Text style={styles.quoteAuthor}>- Unknown</Text>
        </Animated.View>

        {/* Action Cards */}
        <Animated.View 
          style={[
            styles.actionCardsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('WorkoutHistory')}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.actionCardGradient}
            >
              <Ionicons name="analytics" size={32} color={colors.white} />
              <Text style={styles.actionCardTitle}>View Progress</Text>
              <Text style={styles.actionCardSubtitle}>Track your journey</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleShare}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.actionCardGradient}
            >
              <Ionicons name="share-social" size={32} color={colors.white} />
              <Text style={styles.actionCardTitle}>Share Success</Text>
              <Text style={styles.actionCardSubtitle}>Inspire others</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <Animated.View 
        style={[
          styles.bottomAction,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('TrainingHome')}
        >
          <LinearGradient
            colors={[colors.burntOrange, '#FF6B35']}
            style={styles.homeButtonGradient}
          >
            <Text style={styles.homeButtonText}>Continue Training</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.1,
    right: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: colors.burntOrange,
    opacity: 0.1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.2,
    left: -width * 0.4,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: colors.white,
    opacity: 0.05,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
  },
  durationText: {
    fontSize: 16,
    color: colors.burntOrange,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 40,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  scoresSection: {
    marginBottom: 30,
  },
  scoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreBlockName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
  },
  scoreValueContainer: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  scoreReps: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  scoreExerciseName: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  scoreType: {
    fontSize: 10,
    color: colors.burntOrange,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  achievementsSection: {
    marginBottom: 30,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
    lineHeight: 20,
  },
  quoteSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  quoteAuthor: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.7,
    fontWeight: '500',
  },
  actionCardsSection: {
    flexDirection: 'row',
    marginHorizontal: -8,
    marginBottom: 30,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 8,
  },
  actionCardGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginTop: 12,
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  homeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  homeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  homeButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
});

export default WorkoutCompleteScreen; 