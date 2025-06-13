import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';

const ConfirmationScreen = ({ navigation }) => {
  const handleStartTraining = () => {
    navigation.navigate('TrainingHome');
  };

  const handleExploreStore = () => {
    navigation.navigate('StoreHome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🏋️‍♂️</Text>
        <Text style={styles.title}>Welcome to the Grind</Text>
        <Text style={styles.subtitle}>
          You're now part of the Medeiros Method family. Time to transform your training.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={handleStartTraining}
          >
            <Text style={styles.primaryButtonText}>Start Training</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={handleExploreStore}
          >
            <Text style={styles.secondaryButtonText}>Explore Store</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.boneWhite,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.slateBlue,
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.burntOrange,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.slateBlue,
  },
  primaryButtonText: {
    color: colors.boneWhite,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.slateBlue,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ConfirmationScreen; 