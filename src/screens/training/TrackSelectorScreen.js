import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { workoutService } from '../../services/workoutService';
import { useFocusEffect } from '@react-navigation/native';

const TrackSelectorScreen = ({ navigation }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrackIds, setSelectedTrackIds] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load tracks and user subscriptions on mount/focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const load = async () => {
        setLoading(true);
        try {
          const [tracksData, userSubs] = await Promise.all([
            workoutService.getWorkoutTracks(),
            workoutService.getUserActiveSubscriptions(),
          ]);
          if (!isActive) return;
          setTracks(tracksData);
          setActiveSubscriptions(userSubs || []);
          setSelectedTrackIds((userSubs || []).map(sub => sub.workout_track_id || sub.track_id));
        } catch (err) {
          if (!isActive) return;
          setError('Failed to load tracks');
          console.error('Error loading tracks:', err);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      load();
      return () => { isActive = false; };
    }, [])
  );

  const toggleTrack = (trackId) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleSaveSelection = async () => {
    setSaving(true);
    try {
      // Subscribe to newly selected tracks
      for (const track of tracks) {
        const isSelected = selectedTrackIds.includes(track.id);
        const wasActive = activeSubscriptions.some(sub => (sub.workout_track_id || sub.track_id) === track.id);
        if (isSelected && !wasActive) {
          await workoutService.subscribeToWorkoutTrack(track.id);
        } else if (!isSelected && wasActive) {
          // Pause the subscription
          const sub = activeSubscriptions.find(sub => (sub.workout_track_id || sub.track_id) === track.id);
          if (sub) await workoutService.pauseTrackSubscription(sub.id);
        }
      }
      navigation.navigate('TrainingHome');
    } catch (err) {
      setError('Failed to update track subscriptions');
      console.error('Error saving track selection:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderTrackCard = (track) => {
    const isSelected = selectedTrackIds.includes(track.id);
    return (
      <TouchableOpacity
        key={track.id}
        style={[styles.trackCard, isSelected && styles.selectedCard]}
        onPress={() => toggleTrack(track.id)}
        activeOpacity={0.8}
      >
        <View style={styles.trackHeader}>
          <View style={styles.trackTitleContainer}>
            <Text style={styles.trackEmoji}>{track.emoji}</Text>
            <Text style={styles.trackName}>{track.name}</Text>
          </View>
          <View style={styles.difficultyContainer}>
            <Text style={styles.difficultyText}>Difficulty: {track.difficulty_level}/5</Text>
          </View>
        </View>
        <Text style={styles.trackDescription}>{track.description}</Text>
        <View style={styles.frequencyContainer}>
          <Text style={styles.frequencyText}>📅 {track.frequency_description}</Text>
        </View>
        <View style={styles.featuresContainer}>
          {track.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureText}>• {feature}</Text>
            </View>
          ))}
        </View>
        <View style={styles.suitableForContainer}>
          <Text style={styles.suitableForTitle}>Great for:</Text>
          <Text style={styles.suitableForText}>{track.suitable_for.join(', ')}</Text>
        </View>
        <View style={[styles.selectButton, isSelected && styles.selectedButton]}>
          <Text style={styles.selectButtonText}>{isSelected ? 'Selected' : 'Tap to Select'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.burntOrange} />
        <Text style={styles.loadingText}>Loading tracks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setError(null) || setLoading(true)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Tracks</Text>
          <Text style={styles.subtitle}>
            Select one or more training tracks that fit your goals. You can change these anytime.
          </Text>
        </View>
        <View style={styles.tracksContainer}>
          {tracks.map(renderTrackCard)}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSaveSelection}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Selection'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.boneWhite,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    lineHeight: 24,
  },
  tracksContainer: {
    padding: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  difficultyContainer: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '600',
  },
  trackDescription: {
    fontSize: 16,
    color: colors.gray,
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 25,
  },
  featureItem: {
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.slateBlue,
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: colors.burntOrange,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: colors.boneWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  frequencyContainer: {
    marginBottom: 15,
  },
  frequencyText: {
    fontSize: 14,
    color: colors.slateBlue,
    fontWeight: '500',
  },
  suitableForContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  suitableForTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 4,
  },
  suitableForText: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 18,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.gray,
  },
  errorText: {
    fontSize: 16,
    color: colors.error || '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.boneWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedCard: {
    borderColor: colors.burntOrange,
    borderWidth: 2,
    shadowColor: colors.burntOrange,
    shadowOpacity: 0.2,
  },
  selectedButton: {
    backgroundColor: colors.burntOrange,
  },
  saveButton: {
    backgroundColor: colors.slateBlue,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray,
  },
  saveButtonText: {
    color: colors.boneWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TrackSelectorScreen; 