import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { workoutService } from '../../services/workoutService';
import { formatSessionName } from '../../utils/formatting';

const { width, height } = Dimensions.get('window');

const WorkoutCompleteScreen = ({ navigation, route }) => {
  const { workout } = route.params || {};
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalExercises: 0,
    totalSets: 0,
    totalReps: 0,
    estimatedCalories: 0,
  });

  useEffect(() => {
    calculateStats();
    loadAchievements();
  }, []);

  const calculateStats = () => {
    if (!workout?.blocks) return;

    const stats = workout.blocks.reduce((acc, block) => {
      block.exercises.forEach(exercise => {
        acc.totalExercises++;
        acc.totalSets += exercise.sets;
        acc.totalReps += exercise.sets * exercise.reps;
      });
      return acc;
    }, {
      totalExercises: 0,
      totalSets: 0,
      totalReps: 0,
      estimatedCalories: 0,
    });

    // Rough calorie estimation based on workout intensity and duration
    stats.estimatedCalories = Math.round(workout.duration_minutes * 8 * (workout.intensity_level / 5));
    setStats(stats);
  };

  const loadAchievements = async () => {
    try {
      const newAchievements = await workoutService.getWorkoutAchievements(workout.id);
      setAchievements(newAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
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

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Success Message */}
        <View style={styles.successContainer}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={40} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Workout Complete!</Text>
          <Text style={styles.successSubtitle}>
            Great job completing {formatSessionName(workout.name)}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalExercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalReps}</Text>
            <Text style={styles.statLabel}>Reps</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.estimatedCalories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>

        {/* Achievements */}
        {achievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements Unlocked</Text>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Ionicons name={achievement.icon} size={24} color={colors.burntOrange} />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Next Steps */}
        <View style={styles.nextStepsSection}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <TouchableOpacity
            style={styles.nextStepCard}
            onPress={() => navigation.navigate('WorkoutHistory')}
          >
            <Ionicons name="time-outline" size={24} color={colors.slateBlue} />
            <View style={styles.nextStepContent}>
              <Text style={styles.nextStepTitle}>View Workout History</Text>
              <Text style={styles.nextStepDescription}>
                Track your progress and see your improvements over time
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextStepCard}
            onPress={() => navigation.navigate('TrainingHome')}
          >
            <Ionicons name="calendar-outline" size={24} color={colors.slateBlue} />
            <View style={styles.nextStepContent}>
              <Text style={styles.nextStepTitle}>Plan Next Workout</Text>
              <Text style={styles.nextStepDescription}>
                Schedule your next training session
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={colors.white} />
          <Text style={styles.actionButtonText}>Share Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.homeButton]}
          onPress={() => navigation.navigate('TrainingHome')}
        >
          <Text style={styles.actionButtonText}>Back to Home</Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.burntOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 18,
    color: colors.white + 'CC',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 30,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: colors.white + 'CC',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 15,
  },
  achievementsSection: {
    marginBottom: 30,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.gray,
  },
  nextStepsSection: {
    marginBottom: 30,
  },
  nextStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextStepContent: {
    flex: 1,
    marginLeft: 15,
  },
  nextStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 4,
  },
  nextStepDescription: {
    fontSize: 14,
    color: colors.gray,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  shareButton: {
    backgroundColor: colors.slateBlue,
  },
  homeButton: {
    backgroundColor: colors.burntOrange,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default WorkoutCompleteScreen; 