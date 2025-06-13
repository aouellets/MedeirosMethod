import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { workoutService } from '../../services/workoutService';
import { formatSessionName, formatSessionType } from '../../utils/formatting';

const { width, height } = Dimensions.get('window');

const WorkoutHistoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    streakDays: 0,
    averageIntensity: 0,
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    loadWorkoutHistory();
  }, [selectedTimeframe]);

  const loadWorkoutHistory = async () => {
    try {
      setLoading(true);
      const [history, workoutStats] = await Promise.all([
        workoutService.getWorkoutHistory(selectedTimeframe),
        workoutService.getWorkoutStats(selectedTimeframe),
      ]);
      setWorkoutHistory(history);
      setStats(workoutStats);
    } catch (error) {
      console.error('Error loading workout history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      {['week', 'month', 'year', 'all'].map((timeframe) => (
        <TouchableOpacity
          key={timeframe}
          style={[
            styles.timeframeButton,
            selectedTimeframe === timeframe && styles.selectedTimeframe,
          ]}
          onPress={() => setSelectedTimeframe(timeframe)}
        >
          <Text
            style={[
              styles.timeframeText,
              selectedTimeframe === timeframe && styles.selectedTimeframeText,
            ]}
          >
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons name="fitness-outline" size={24} color={colors.burntOrange} />
        <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
        <Text style={styles.statLabel}>Workouts</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="time-outline" size={24} color={colors.burntOrange} />
        <Text style={styles.statValue}>{stats.totalMinutes}</Text>
        <Text style={styles.statLabel}>Minutes</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="flame-outline" size={24} color={colors.burntOrange} />
        <Text style={styles.statValue}>{stats.streakDays}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="speedometer-outline" size={24} color={colors.burntOrange} />
        <Text style={styles.statValue}>{stats.averageIntensity}/10</Text>
        <Text style={styles.statLabel}>Avg Intensity</Text>
      </View>
    </View>
  );

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutTypeContainer}>
          <Text style={styles.workoutType}>
            {formatSessionType(item.session_type)}
          </Text>
        </View>
        <Text style={styles.workoutDate}>
          {new Date(item.completed_at).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.workoutName}>{formatSessionName(item.name)}</Text>

      <View style={styles.workoutStats}>
        <View style={styles.workoutStat}>
          <Ionicons name="time-outline" size={16} color={colors.gray} />
          <Text style={styles.workoutStatText}>{item.duration_minutes} min</Text>
        </View>
        <View style={styles.workoutStat}>
          <Ionicons name="speedometer-outline" size={16} color={colors.gray} />
          <Text style={styles.workoutStatText}>
            Intensity: {item.intensity_level}/10
          </Text>
        </View>
        <View style={styles.workoutStat}>
          <Ionicons name="fitness-outline" size={16} color={colors.gray} />
          <Text style={styles.workoutStatText}>
            {item.total_exercises} exercises
          </Text>
        </View>
      </View>

      {item.notes && (
        <Text style={styles.workoutNotes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <ActivityIndicator size="large" color={colors.white} />
        <Text style={styles.loadingText}>Loading your history...</Text>
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

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout History</Text>
          <View style={styles.backButton} />
        </View>

        {renderTimeframeSelector()}
        {renderStats()}

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {workoutHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={48} color={colors.gray} />
              <Text style={styles.emptyStateText}>
                No workouts completed in this period
              </Text>
              <TouchableOpacity
                style={styles.startWorkoutButton}
                onPress={() => navigation.navigate('TrainingHome')}
              >
                <Text style={styles.startWorkoutButtonText}>Start a Workout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={workoutHistory}
              renderItem={renderWorkoutItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.workoutList}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.boneWhite,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white + '20',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedTimeframe: {
    backgroundColor: colors.white,
  },
  timeframeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTimeframeText: {
    color: colors.slateBlue,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 30,
  },
  statCard: {
    width: '50%',
    padding: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.white + 'CC',
  },
  historySection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 15,
  },
  workoutList: {
    gap: 12,
  },
  workoutCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutTypeContainer: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  workoutType: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateBlue,
  },
  workoutDate: {
    fontSize: 12,
    color: colors.gray,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 12,
  },
  workoutStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutStatText: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 4,
  },
  workoutNotes: {
    fontSize: 14,
    color: colors.gray,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  startWorkoutButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startWorkoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 16,
  },
});

export default WorkoutHistoryScreen; 