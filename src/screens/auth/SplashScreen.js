import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation, onAnimationComplete }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loadingDots = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimationSequence();
  }, []);

  const startAnimationSequence = () => {
    // Background fade in
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Logo animations
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        delay: 300,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 1200,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Title animation
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(titleTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);

    // Subtitle animation
    setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1200);

    // Tagline animation
    setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1600);

    // Loading dots animation
    setTimeout(() => {
      startLoadingAnimation();
    }, 2000);

    // Complete animation and navigate
    setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      } else if (navigation) {
        navigation.replace('Welcome');
      }
    }, 4000);
  };

  const startLoadingAnimation = () => {
    const pulseAnimation = Animated.sequence([
      Animated.timing(loadingDots, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(loadingDots, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulseAnimation).start();
  };

  const logoRotationInterpolated = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundContainer, { opacity: backgroundOpacity }]}>
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <View style={styles.contentContainer}>
        {/* Logo Animation */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { rotate: logoRotationInterpolated },
              ],
            },
          ]}
        >
          <Image
            source={require('../../../assets/logo_transparent.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title Animation */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={styles.mainTitle}>MEDEIROS</Text>
          <Text style={styles.subTitle}>METHOD</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={[styles.subtitleContainer, { opacity: subtitleOpacity }]}>
          <Text style={styles.subtitle}>Elite CrossFit Training</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity }]}>
          <Text style={styles.tagline}>Earned Every Day</Text>
        </Animated.View>

        {/* Loading Animation */}
        <Animated.View style={[styles.loadingContainer, { opacity: loadingDots }]}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: loadingDots }]} />
            <Animated.View style={[styles.dot, { opacity: loadingDots }]} />
            <Animated.View style={[styles.dot, { opacity: loadingDots }]} />
          </View>
          <Text style={styles.loadingText}>Loading your training...</Text>
        </Animated.View>
      </View>

      {/* Decorative Elements */}
      <View style={styles.decorativeContainer}>
        <Animated.View style={[styles.decorativeCircle1, { opacity: logoOpacity }]} />
        <Animated.View style={[styles.decorativeCircle2, { opacity: subtitleOpacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slateBlue,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 3,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.boneWhite,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: -5,
  },
  subtitleContainer: {
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: colors.lightGray,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 1,
  },
  taglineContainer: {
    marginBottom: 60,
  },
  tagline: {
    fontSize: 20,
    color: colors.white,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 2,
    fontStyle: 'italic',
    textShadowColor: colors.burntOrange,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(230, 126, 34, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.3)',
  },
  loadingContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.burntOrange,
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 14,
    color: colors.lightGray,
    fontWeight: '500',
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
    right: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: colors.burntOrange,
    opacity: 0.1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.1,
    left: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: colors.white,
    opacity: 0.05,
  },
});

export default SplashScreen; 