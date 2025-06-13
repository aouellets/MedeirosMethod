import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { workoutService } from '../../services/workoutService';
import { formatSessionName, formatSessionType } from '../../utils/formatting';

const { width, height } = Dimensions.get('window');

const TrainingHomeScreen = ({ navigation, route }) => {
  const [activeTracks, setActiveTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [todaysWorkout, setTodaysWorkout] = useState(null);
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubscriptions, setUserSubscriptions] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (route.params?.selectedTrack) {
      loadTrackData(route.params.selectedTrack);
    }
  }, [route.params?.selectedTrack]);

  const loadUserData = async () => {
    try {
      const subscriptions = await workoutService.getUserActiveSubscriptions();
      setUserSubscriptions(subscriptions);
      
      if (subscriptions.length > 0) {
        const tracks = subscriptions.map(sub => sub.workout_tracks);
        setActiveTracks(tracks);
        setSelectedTrack(tracks[0]);
        await loadTrackData(tracks[0].slug);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrackData = async (trackSlug) => {
    try {
      const [todaysSessionData, weekSessionsData] = await Promise.all([
        workoutService.getTodaysSession(trackSlug),
        workoutService.getThisWeekSessions(trackSlug)
      ]);
      
      setTodaysWorkout(todaysSessionData);
      setThisWeekWorkouts(weekSessionsData);
    } catch (error) {
      console.error('Error loading track data:', error);
    }
  };

  const handleTrackSelect = async (track) => {
    setSelectedTrack(track);
    await loadTrackData(track.slug);
  };

  const renderWorkoutCard = ({ item }) => {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayLabel = item.day_of_week <= dayLabels.length ? dayLabels[item.day_of_week - 1] : `Day ${item.day_of_week}`;
    
    return (
      <TouchableOpacity 
        style={[
          styles.workoutCard, 
          item.completed && styles.completedCard,
          item.is_current && styles.currentCard
        ]}
        onPress={() => navigation.navigate('WorkoutPreview', { workout: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.workoutDay}>{dayLabel}</Text>
          <Text style={styles.sessionType}>{formatSessionType(item.session_type)}</Text>
        </View>
        
        <Text style={styles.workoutName}>{formatSessionName(item.name)}</Text>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Duration</Text>
            <Text style={styles.metricValue}>{item.duration_minutes} min</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Intensity</Text>
            <Text style={styles.metricValue}>{item.intensity_level}/10</Text>
          </View>
        </View>

        {item.completed && <Text style={styles.completedText}>✓ Completed</Text>}
        {item.is_current && <Text style={styles.currentText}>Current</Text>}
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.loadingText}>Loading your training...</Text>
      </View>
    );
  }

  if (activeTracks.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <Text style={styles.noTrackTitle}>No Track Selected</Text>
        <Text style={styles.noTrackSubtitle}>Choose a training track to get started</Text>
        <TouchableOpacity 
          style={styles.selectTrackButton}
          onPress={() => navigation.navigate('TrackSelector')}
        >
          <Text style={styles.selectTrackButtonText}>Select Track</Text>
        </TouchableOpacity>
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Ready to train?</Text>
            <TouchableOpacity 
              style={styles.trackSelector}
              onPress={() => navigation.navigate('TrackSelector')}
            >
              <Text style={styles.changeText}>Manage Tracks</Text>
            </TouchableOpacity>
          </View>

          {/* Track Switcher */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.trackSwitcher}
            contentContainerStyle={styles.trackSwitcherContent}
          >
            {activeTracks.map((track) => (
              <TouchableOpacity
                key={track.id}
                style={[
                  styles.trackTab,
                  selectedTrack?.id === track.id && styles.selectedTrackTab
                ]}
                onPress={() => handleTrackSelect(track)}
              >
                <Text style={[
                  styles.trackTabText,
                  selectedTrack?.id === track.id && styles.selectedTrackTabText
                ]}>
                  {track.emoji} {track.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Today's Workout */}
          {todaysWorkout && (
            <View style={styles.todaySection}>
              <Text style={styles.sectionTitle}>Today's Workout</Text>
              <View style={styles.todayCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sessionType}>{formatSessionType(todaysWorkout.session_type)}</Text>
                </View>
                
                <Text style={styles.todayWorkoutName}>{formatSessionName(todaysWorkout.name)}</Text>
                
                <View style={styles.metricsContainer}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Duration</Text>
                    <Text style={styles.metricValue}>{todaysWorkout.duration_minutes} min</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Intensity</Text>
                    <Text style={styles.metricValue}>{todaysWorkout.intensity_level}/10</Text>
                  </View>
                </View>

                <Text style={styles.blocksText}>
                  {todaysWorkout.blocks?.length || 0} Training Blocks
                </Text>
                
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={() => navigation.navigate('WorkoutPreview', { workout: todaysWorkout })}
                >
                  <Text style={styles.startButtonText}>Start Workout</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* This Week */}
          <View style={styles.weekSection}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <FlatList
              data={thisWeekWorkouts}
              renderItem={renderWorkoutCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weekList}
            />
          </View>

          {/* History Button */}
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => navigation.navigate('WorkoutHistory')}
          >
            <Text style={styles.historyButtonText}>View Workout History</Text>
          </TouchableOpacity>
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
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  trackSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  changeText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  trackSwitcher: {
    maxHeight: 50,
    marginBottom: 20,
  },
  trackSwitcherContent: {
    paddingHorizontal: 5,
  },
  trackTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedTrackTab: {
    backgroundColor: colors.burntOrange,
    borderColor: colors.burntOrange,
  },
  trackTabText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  selectedTrackTabText: {
    color: colors.white,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 15,
  },
  todaySection: {
    marginBottom: 30,
  },
  todayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayWorkoutName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slateBlue,
  },
  workoutDay: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slateBlue,
  },
  sessionType: {
    fontSize: 12,
    color: colors.burntOrange,
    fontWeight: '600',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 12,
  },
  blocksText: {
    fontSize: 14,
    color: colors.slateBlue,
    marginBottom: 15,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: colors.burntOrange,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  weekSection: {
    marginBottom: 30,
  },
  weekList: {
    paddingRight: 20,
  },
  workoutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedCard: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderColor: colors.green,
    borderWidth: 1,
  },
  currentCard: {
    borderColor: colors.burntOrange,
    borderWidth: 2,
  },
  completedText: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '600',
    marginTop: 4,
  },
  currentText: {
    fontSize: 12,
    color: colors.burntOrange,
    fontWeight: '600',
    marginTop: 4,
  },
  historyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  historyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 20,
  },
  noTrackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
  },
  noTrackSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 30,
  },
  selectTrackButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  selectTrackButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TrainingHomeScreen; 