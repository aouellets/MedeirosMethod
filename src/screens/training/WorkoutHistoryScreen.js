import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { formatSessionName, formatSessionType } from '../../utils/formatting';

const { width, height } = Dimensions.get('window');

const WorkoutHistoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    streakDays: 0,
    averageIntensity: 0,
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWorkoutHistory();
  }, [selectedTimeframe]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWorkoutHistory().finally(() => setRefreshing(false));
  }, [selectedTimeframe]);

  const getDateRangeForTimeframe = (timeframe) => {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    return startDate;
  };

  const loadWorkoutHistory = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      // Calculate date range based on timeframe
      const startDate = getDateRangeForTimeframe(selectedTimeframe);
      
      // Log filtering information for debugging
      console.log(`Filtering workouts for timeframe: ${selectedTimeframe}`, {
        startDate: selectedTimeframe !== 'all' ? startDate.toISOString() : 'No date filter',
        selectedTimeframe
      });

      // Fetch workout history with session details
      let query = supabase
        .from('user_session_completions')
        .select(`
          *,
          sessions (
            id,
            name,
            session_type,
            duration_minutes,
            intensity_level,
            workout_tracks (
              name,
              emoji
            ),
            blocks (
              block_exercises (
                id
              )
            )
          )
        `)
        .eq('user_id', user.id);

      // Only add date filter if not showing all data
      if (selectedTimeframe !== 'all') {
        query = query.gte('completed_at', startDate.toISOString());
      }

      const { data: history, error: historyError } = await query
        .order('completed_at', { ascending: false });

      if (historyError) throw historyError;

      // Process history data
      const processedHistory = (history || []).map(completion => ({
        id: completion.id,
        completed_at: completion.completed_at,
        duration_minutes: completion.duration_minutes || completion.sessions?.duration_minutes || 0,
        notes: completion.notes,
        name: completion.sessions?.name || 'Unknown Workout',
        session_type: completion.sessions?.session_type || 'General',
        intensity_level: completion.sessions?.intensity_level || 5,
        track_name: completion.sessions?.workout_tracks?.name || 'Unknown Track',
        track_emoji: completion.sessions?.workout_tracks?.emoji || '💪',
        total_exercises: completion.sessions?.blocks?.reduce(
          (acc, block) => acc + (block.block_exercises?.length || 0),
          0
        ) || 0,
        exercises_completed: completion.exercises_completed || 0,
        sets_completed: completion.sets_completed || 0,
        total_reps: completion.total_reps || 0,
        rx_level: completion.rx_level,
        difficulty_rating: completion.difficulty_rating,
        enjoyment_rating: completion.enjoyment_rating,
      }));

      // Calculate statistics
      const totalWorkouts = processedHistory.length;
      const totalMinutes = processedHistory.reduce((acc, workout) => acc + workout.duration_minutes, 0);
      const averageIntensity = totalWorkouts > 0 
        ? Math.round((processedHistory.reduce((acc, workout) => acc + workout.intensity_level, 0) / totalWorkouts) * 10) / 10
        : 0;

      // Calculate streak
      const streakDays = calculateStreak(processedHistory);

      setWorkoutHistory(processedHistory);
      setStats({
        totalWorkouts,
        totalMinutes,
        streakDays,
        averageIntensity,
      });
    } catch (error) {
      console.error('Error loading workout history:', error);
      setError(error.message);
      // Show user-friendly error
      if (error.message.includes('not authenticated')) {
        Alert.alert('Authentication Error', 'Please log in again to view your workout history.');
      } else {
        Alert.alert('Error', 'Failed to load workout history. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (history) => {
    if (history.length === 0) return 0;

    const sortedDates = history
      .map(workout => new Date(workout.completed_at).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => new Date(b) - new Date(a)); // Sort newest first

    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = today;

    for (const date of sortedDates) {
      const checkDate = new Date(date);
      const expectedDate = new Date(currentDate);
      
      if (checkDate.toDateString() === expectedDate.toDateString()) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
        currentDate = expectedDate.toDateString();
      } else if (streak === 0 && checkDate.toDateString() === new Date(today).toDateString()) {
        // If today is the first day, continue checking
        continue;
      } else {
        break; // Streak broken
      }
    }

    return streak;
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
          disabled={loading}
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
        <View style={styles.statIconContainer}>
          <Ionicons name="fitness-outline" size={24} color={colors.burntOrange} />
        </View>
        <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
        <Text style={styles.statLabel}>Workouts</Text>
      </View>
      <View style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="time-outline" size={24} color={colors.burntOrange} />
        </View>
        <Text style={styles.statValue}>{stats.totalMinutes}</Text>
        <Text style={styles.statLabel}>Minutes</Text>
      </View>
      <View style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="flame-outline" size={24} color={colors.burntOrange} />
        </View>
        <Text style={styles.statValue}>{stats.streakDays}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>
      <View style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="speedometer-outline" size={24} color={colors.burntOrange} />
        </View>
        <Text style={styles.statValue}>{stats.averageIntensity}/10</Text>
        <Text style={styles.statLabel}>Avg Intensity</Text>
      </View>
    </View>
  );

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
      activeOpacity={0.8}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutTrackContainer}>
          <Text style={styles.trackEmoji}>{item.track_emoji}</Text>
          <Text style={styles.trackName}>{item.track_name}</Text>
        </View>
        <View style={styles.workoutTypeContainer}>
          <Text style={styles.workoutType}>
            {formatSessionType(item.session_type)}
          </Text>
        </View>
      </View>

      <Text style={styles.workoutName}>{formatSessionName(item.name)}</Text>

      <View style={styles.workoutMetrics}>
        <View style={styles.metricItem}>
          <Ionicons name="time-outline" size={16} color={colors.gray} />
          <Text style={styles.metricText}>{item.duration_minutes} min</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="speedometer-outline" size={16} color={colors.gray} />
          <Text style={styles.metricText}>
            Intensity: {item.intensity_level}/10
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="fitness-outline" size={16} color={colors.gray} />
          <Text style={styles.metricText}>
            {item.exercises_completed}/{item.total_exercises} exercises
          </Text>
        </View>
      </View>

      {item.rx_level && (
        <View style={styles.rxLevelContainer}>
          <Text style={styles.rxLevel}>{item.rx_level}</Text>
        </View>
      )}

      <View style={styles.workoutFooter}>
        <Text style={styles.workoutDate}>
          {new Date(item.completed_at).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {item.difficulty_rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Difficulty:</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Ionicons
                  key={star}
                  name={star <= item.difficulty_rating ? 'star' : 'star-outline'}
                  size={12}
                  color={colors.burntOrange}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {item.notes && (
        <Text style={styles.workoutNotes} numberOfLines={2}>
          "{item.notes}"
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <ActivityIndicator size="large" color={colors.white} />
        <Text style={styles.loadingText}>
          Loading {selectedTimeframe === 'all' ? 'all' : selectedTimeframe} workout history...
        </Text>
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

      {/* Decorative Elements */}
      <View style={styles.decorativeContainer}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.burntOrange]}
            tintColor={colors.white}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout History</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onRefresh}
            disabled={loading || refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color={loading || refreshing ? colors.white + '60' : colors.white} 
            />
          </TouchableOpacity>
        </View>

        {renderTimeframeSelector()}
        {renderStats()}

        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {workoutHistory.length > 0 && (
              <Text style={styles.workoutCount}>
                {workoutHistory.length} workout{workoutHistory.length !== 1 ? 's' : ''}
                {selectedTimeframe !== 'all' && ` (${selectedTimeframe})`}
              </Text>
            )}
          </View>
          {error ? (
            <View style={styles.errorState}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.red} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadWorkoutHistory}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : workoutHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={48} color={colors.gray} />
              <Text style={styles.emptyStateText}>
                No workouts completed 
                {selectedTimeframe !== 'all' && ` in the last ${selectedTimeframe}`}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedTimeframe === 'all' 
                  ? 'Ready to start your fitness journey? Complete your first workout!'
                  : 'Time to get moving! Start a workout to build your history.'
                }
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
              showsVerticalScrollIndicator={false}
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
    backgroundColor: colors.slateBlue,
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
    bottom: 0,
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.white + '08',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 150,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.white + '05',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.white + '20',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white + '20',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTimeframe: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginHorizontal: -6,
    marginBottom: 30,
  },
  statCard: {
    width: '50%',
    padding: 6,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.white + 'CC',
    textAlign: 'center',
  },
  historySection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  workoutCount: {
    fontSize: 14,
    color: colors.white + 'CC',
    fontWeight: '500',
  },
  workoutList: {
    gap: 16,
  },
  workoutCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  trackName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
  },
  workoutTypeContainer: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workoutType: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateBlue,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 12,
    lineHeight: 24,
  },
  workoutMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metricText: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 4,
  },
  rxLevelContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.burntOrange + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  rxLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.burntOrange,
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 12,
    color: colors.gray,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 12,
    color: colors.gray,
    marginRight: 4,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  workoutNotes: {
    fontSize: 14,
    color: colors.gray,
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.slateBlue,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  startWorkoutButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: colors.burntOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startWorkoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.red,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.slateBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
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