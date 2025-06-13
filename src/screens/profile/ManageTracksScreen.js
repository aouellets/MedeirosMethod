import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { trackService } from '../../services/trackService';

const ManageTracksScreen = ({ navigation }) => {
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const subscriptions = await trackService.getUserActiveSubscriptions();
      setActiveSubscriptions(subscriptions || []);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
      setError('Failed to load your track subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseTrack = async (subscription) => {
    Alert.alert(
      'Pause Track',
      `Are you sure you want to pause the ${subscription.tracks.name} track? You can resume it anytime.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause Track',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              await trackService.pauseTrackSubscription(subscription.id);
              await loadSubscriptions();
            } catch (err) {
              console.error('Error pausing track:', err);
              Alert.alert('Error', 'Failed to pause track. Please try again.');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleResumeTrack = async (subscription) => {
    try {
      setUpdating(true);
      await trackService.subscribeToTrack(subscription.track_id);
      await loadSubscriptions();
    } catch (err) {
      console.error('Error resuming track:', err);
      Alert.alert('Error', 'Failed to resume track. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddTrack = () => {
    navigation.navigate('TrackSelector');
  };

  const renderTrackCard = (subscription) => {
    const track = subscription.tracks;
    const isActive = subscription.is_active;

    return (
      <View key={subscription.id} style={[styles.trackCard, !isActive && styles.pausedCard]}>
        <View style={styles.trackHeader}>
          <View style={styles.trackTitleContainer}>
            <Text style={styles.trackEmoji}>{track.emoji}</Text>
            <Text style={styles.trackName}>{track.name}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, isActive ? styles.activeStatus : styles.pausedStatus]}>
              {isActive ? 'Active' : 'Paused'}
            </Text>
          </View>
        </View>

        <Text style={styles.trackDescription}>{track.description}</Text>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Week {subscription.current_week}, Day {subscription.current_day}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          {isActive ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.pauseButton]}
              onPress={() => handlePauseTrack(subscription)}
              disabled={updating}
            >
              <Text style={styles.actionButtonText}>Pause Track</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.resumeButton]}
              onPress={() => handleResumeTrack(subscription)}
              disabled={updating}
            >
              <Text style={styles.actionButtonText}>Resume Track</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => navigation.navigate('TrainingHome', { selectedTrack: track })}
          >
            <Text style={styles.actionButtonText}>View Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.loadingText}>Loading your tracks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSubscriptions}>
          <Text style={styles.retryButtonText}>Try Again</Text>
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Manage Tracks</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {activeSubscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No Active Tracks</Text>
              <Text style={styles.emptyStateText}>
                You haven't subscribed to any training tracks yet.
              </Text>
              <TouchableOpacity style={styles.addTrackButton} onPress={handleAddTrack}>
                <Text style={styles.addTrackButtonText}>Browse Tracks</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.tracksList}>
                {activeSubscriptions.map(renderTrackCard)}
              </View>
              <TouchableOpacity style={styles.addTrackButton} onPress={handleAddTrack}>
                <Text style={styles.addTrackButtonText}>Add Another Track</Text>
              </TouchableOpacity>
            </>
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
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 20,
  },
  errorText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  tracksList: {
    gap: 20,
  },
  trackCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pausedCard: {
    opacity: 0.7,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  trackTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackEmoji: {
    fontSize: 28,
    marginRight: 8,
  },
  trackName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  statusContainer: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeStatus: {
    color: colors.green,
  },
  pausedStatus: {
    color: colors.gray,
  },
  trackDescription: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: 15,
  },
  progressContainer: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  progressText: {
    fontSize: 14,
    color: colors.slateBlue,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: colors.red,
  },
  resumeButton: {
    backgroundColor: colors.green,
  },
  viewButton: {
    backgroundColor: colors.slateBlue,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 30,
  },
  addTrackButton: {
    backgroundColor: colors.burntOrange,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addTrackButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManageTracksScreen; 