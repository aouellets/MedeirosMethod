import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const OrderConfirmationScreen = ({ navigation, route }) => {
  const { orderNumber, total } = route.params || {};
  
  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      ]),
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleContinueShopping = () => {
    navigation.navigate('StoreHome');
  };

  const handleViewOrders = () => {
    // Navigate to order history when implemented
    navigation.navigate('StoreHome');
  };

  const handleGoHome = () => {
    navigation.navigate('Training'); // Navigate to main training tab
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.slateBlue} />
      
      {/* Background */}
      <LinearGradient
        colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Decorative circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      {/* Custom Header */}
      <SafeAreaView style={styles.customHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerButton} />
          
          <Text style={styles.headerTitle}>Order Confirmed</Text>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleGoHome}
          >
            <Ionicons name="home-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Success Section */}
        <Animated.View style={[
          styles.successSection,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <Animated.View style={[
            styles.checkmarkContainer,
            {
              transform: [{ scale: checkmarkAnim }]
            }
          ]}>
            <MaterialCommunityIcons 
              name="check-circle" 
              size={80} 
              color={colors.green} 
            />
          </Animated.View>
          
          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your purchase. Your order has been successfully placed.
          </Text>
        </Animated.View>

        {/* Order Details */}
        <Animated.View style={[
          styles.orderDetailsSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Order Number:</Text>
              <Text style={styles.orderValue}>{orderNumber || 'JM123456789'}</Text>
            </View>
            
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Total Amount:</Text>
              <Text style={styles.orderValueHighlight}>${(total || 0).toFixed(2)}</Text>
            </View>
            
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Payment Method:</Text>
              <Text style={styles.orderValue}>•••• •••• •••• 1234</Text>
            </View>
            
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Order Date:</Text>
              <Text style={styles.orderValue}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Delivery Information */}
        <Animated.View style={[
          styles.deliverySection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryStep}>
              <View style={styles.stepIconContainer}>
                <MaterialCommunityIcons name="package-variant" size={24} color={colors.burntOrange} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Order Processing</Text>
                <Text style={styles.stepDescription}>
                  Your order is being prepared for shipment
                </Text>
              </View>
            </View>
            
            <View style={styles.stepConnector} />
            
            <View style={styles.deliveryStep}>
              <View style={styles.stepIconContainer}>
                <MaterialCommunityIcons name="truck-delivery" size={24} color={colors.gray} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>In Transit</Text>
                <Text style={styles.stepDescription}>
                  Estimated shipping: 2-3 business days
                </Text>
              </View>
            </View>
            
            <View style={styles.stepConnector} />
            
            <View style={styles.deliveryStep}>
              <View style={styles.stepIconContainer}>
                <MaterialCommunityIcons name="home" size={24} color={colors.gray} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Delivered</Text>
                <Text style={styles.stepDescription}>
                  Estimated delivery: 5-7 business days
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Next Steps */}
        <Animated.View style={[
          styles.nextStepsSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          
          <View style={styles.nextStepsCard}>
            <View style={styles.nextStepItem}>
              <MaterialCommunityIcons name="email-outline" size={24} color={colors.burntOrange} />
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepTitle}>Confirmation Email</Text>
                <Text style={styles.nextStepDescription}>
                  You'll receive an email confirmation with tracking details
                </Text>
              </View>
            </View>
            
            <View style={styles.nextStepItem}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={colors.burntOrange} />
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepTitle}>Order Updates</Text>
                <Text style={styles.nextStepDescription}>
                  We'll notify you when your order ships and is delivered
                </Text>
              </View>
            </View>
            
            <View style={styles.nextStepItem}>
              <MaterialCommunityIcons name="headset" size={24} color={colors.burntOrange} />
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepTitle}>Customer Support</Text>
                <Text style={styles.nextStepDescription}>
                  Need help? Contact our support team anytime
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View style={[
        styles.actionSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleContinueShopping}
        >
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.white} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleViewOrders}
        >
          <Text style={styles.secondaryButtonText}>View Order History</Text>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Decorative elements
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 200,
    left: -75,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(230, 126, 34, 0.08)',
  },

  // Custom header
  customHeader: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginHorizontal: 15,
  },

  // Main content
  mainContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },

  // Success section
  successSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  checkmarkContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Section styling
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  // Order details
  orderDetailsSection: {
    marginBottom: 30,
  },
  orderCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderLabel: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
  orderValue: {
    fontSize: 14,
    color: colors.slateBlue,
    fontWeight: '600',
  },
  orderValueHighlight: {
    fontSize: 16,
    color: colors.burntOrange,
    fontWeight: 'bold',
  },

  // Delivery section
  deliverySection: {
    marginBottom: 30,
  },
  deliveryCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  deliveryStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 18,
  },
  stepConnector: {
    width: 2,
    height: 30,
    backgroundColor: colors.lightGray,
    marginLeft: 23,
    marginVertical: 10,
  },

  // Next steps
  nextStepsSection: {
    marginBottom: 30,
  },
  nextStepsCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    gap: 20,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  nextStepContent: {
    flex: 1,
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
    lineHeight: 18,
  },

  // Action section
  actionSection: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.burntOrange,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: colors.slateBlue,
    fontSize: 16,
    fontWeight: '500',
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});

export default OrderConfirmationScreen; 