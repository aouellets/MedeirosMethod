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
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatSessionName, formatSessionType } from '../../utils/formatting';
import { colors } from '../../theme/colors';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

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

  // Hide the default navigation header
  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation])
  );

  const handleStartWorkout = () => {
    navigation.navigate('WorkoutPlayer', { workout: workoutData });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderIntensityStars = (level) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= level / 2 ? "star" : "star-outline"}
          size={16}
          color={colors.burntOrange}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const renderEquipmentList = () => {
    if (!workoutData.equipment_needed?.length) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.green} />
          <Text style={styles.noEquipmentText}>
            No special equipment needed
          </Text>
        </View>
      );
    }

    return workoutData.equipment_needed.map((equipment, index) => (
      <View key={index} style={styles.equipmentItem}>
        <View style={styles.equipmentIcon}>
          <Ionicons name="fitness-outline" size={20} color={colors.burntOrange} />
        </View>
        <Text style={styles.equipmentText}>{equipment}</Text>
      </View>
    ));
  };

  const renderBlocks = () => {
    if (!workoutData.blocks?.length) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="information-circle-outline" size={24} color={colors.gray} />
          <Text style={styles.noBlocksText}>
            Workout structure will be available when you start
          </Text>
        </View>
      );
    }

    return workoutData.blocks.map((block, index) => (
      <View key={index} style={styles.blockContainer}>
        <View style={styles.blockHeader}>
          <Text style={styles.blockName}>{block.name}</Text>
          <View style={styles.blockBadge}>
            <Text style={styles.blockBadgeText}>Block {index + 1}</Text>
          </View>
        </View>
        
        {block.block_exercises?.map((blockExercise, exIndex) => (
          <View key={exIndex} style={styles.exerciseItem}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>
                {blockExercise.exercises?.name || 'Exercise'}
              </Text>
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{exIndex + 1}</Text>
              </View>
            </View>
            <Text style={styles.exerciseDetails}>
              {blockExercise.sets} sets × {blockExercise.reps} reps
            </Text>
            {blockExercise.rest_seconds && (
              <Text style={styles.restTime}>
                Rest: {Math.floor(blockExercise.rest_seconds / 60)}:{(blockExercise.rest_seconds % 60).toString().padStart(2, '0')}
              </Text>
            )}
            {blockExercise.notes && (
              <Text style={styles.exerciseNotes}>{blockExercise.notes}</Text>
            )}
          </View>
        ))}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Preview</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Workout Info Card */}
          <View style={styles.workoutCard}>
                         <Text style={styles.workoutName}>{formatSessionName(workoutData.name) || 'Workout'}</Text>
            <Text style={styles.sessionType}>
              {formatSessionType(workoutData.session_type) || 'Training Session'}
            </Text>
            
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Ionicons name="time-outline" size={20} color={colors.burntOrange} />
                </View>
                <View>
                  <Text style={styles.statValue}>{workoutData.duration_minutes || 0}</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </View>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Ionicons name="flame-outline" size={20} color={colors.burntOrange} />
                </View>
                <View>
                  <View style={styles.intensityContainer}>
                    {renderIntensityStars(workoutData.intensity_level || 0)}
                  </View>
                  <Text style={styles.statLabel}>Intensity</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Equipment Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="barbell-outline" size={24} color={colors.white} />
              <Text style={styles.sectionTitle}>Equipment</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderEquipmentList()}
            </View>
          </View>

          {/* Workout Structure Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={24} color={colors.white} />
              <Text style={styles.sectionTitle}>Workout Structure</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderBlocks()}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Start Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.burntOrange, '#D35400']}
              style={styles.startButtonGradient}
            >
              <Ionicons name="play" size={24} color={colors.white} style={styles.startIcon} />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  workoutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 8,
  },
  sessionType: {
    fontSize: 16,
    color: colors.burntOrange,
    fontWeight: '600',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.lightGray,
    marginHorizontal: 15,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 12,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
  },
  emptyStateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noEquipmentText: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  noBlocksText: {
    color: colors.gray,
    fontSize: 16,
    marginLeft: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  equipmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  equipmentText: {
    fontSize: 16,
    color: colors.slateBlue,
    fontWeight: '500',
  },
  blockContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  blockName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
    flex: 1,
  },
  blockBadge: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  blockBadgeText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  exerciseItem: {
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.lightOrange,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    flex: 1,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.burntOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
  },
  exerciseDetails: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
    marginBottom: 4,
  },
  restTime: {
    fontSize: 14,
    color: colors.burntOrange,
    fontWeight: '500',
    marginBottom: 4,
  },
  exerciseNotes: {
    fontSize: 14,
    color: colors.gray,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 15,
  },
  startButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startIcon: {
    marginRight: 8,
  },
  startButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WorkoutPreviewScreen; 