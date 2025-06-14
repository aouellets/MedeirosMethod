import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';

const { width: screenWidth } = Dimensions.get('window');

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, getOrderSummary, clearCart } = useCart();
  
  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [loading, setLoading] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [processingOrder, setProcessingOrder] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const [errors, setErrors] = useState({});
  const orderSummary = getOrderSummary();

  useEffect(() => {
    // Start animations
    const timer = setTimeout(() => {
      setLoading(false);
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
        })
      ]).start();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.email.trim()) newErrors.email = 'Email is required';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
    if (!shippingInfo.state.trim()) newErrors.state = 'State is required';
    if (!shippingInfo.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    // Email validation
    if (shippingInfo.email && !/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors = {};
    if (!paymentInfo.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    if (!paymentInfo.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    if (!paymentInfo.cvv.trim()) newErrors.cvv = 'CVV is required';
    if (!paymentInfo.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';

    // Card number validation (basic)
    if (paymentInfo.cardNumber && paymentInfo.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    // CVV validation
    if (paymentInfo.cvv && paymentInfo.cvv.length < 3) {
      newErrors.cvv = 'CVV must be at least 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateShipping()) {
      setCurrentStep(2);
      setErrors({});
    } else if (currentStep === 2 && validatePayment()) {
      setCurrentStep(3);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    } else {
      navigation.goBack();
    }
  };

  const handlePlaceOrder = async () => {
    setProcessingOrder(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const orderNumber = `JM${Date.now()}`;
      clearCart();
      
      navigation.navigate('OrderConfirmation', {
        orderNumber,
        total: orderSummary.total,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const renderProgressBar = () => (
    <Animated.View style={[
      styles.progressContainer,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, currentStep >= 1 && styles.progressStepActive]}>
          <Text style={[styles.progressStepText, currentStep >= 1 && styles.progressStepTextActive]}>1</Text>
        </View>
        <View style={[styles.progressLine, currentStep >= 2 && styles.progressLineActive]} />
        <View style={[styles.progressStep, currentStep >= 2 && styles.progressStepActive]}>
          <Text style={[styles.progressStepText, currentStep >= 2 && styles.progressStepTextActive]}>2</Text>
        </View>
        <View style={[styles.progressLine, currentStep >= 3 && styles.progressLineActive]} />
        <View style={[styles.progressStep, currentStep >= 3 && styles.progressStepActive]}>
          <Text style={[styles.progressStepText, currentStep >= 3 && styles.progressStepTextActive]}>3</Text>
        </View>
      </View>
      
      <View style={styles.progressLabels}>
        <Text style={[styles.progressLabel, currentStep === 1 && styles.progressLabelActive]}>Shipping</Text>
        <Text style={[styles.progressLabel, currentStep === 2 && styles.progressLabelActive]}>Payment</Text>
        <Text style={[styles.progressLabel, currentStep === 3 && styles.progressLabelActive]}>Review</Text>
      </View>
    </Animated.View>
  );

  const renderShippingForm = () => (
    <Animated.View style={[
      styles.formSection,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <Text style={styles.sectionTitle}>Shipping Information</Text>
      
      <View style={styles.formCard}>
        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="Enter first name"
              value={shippingInfo.firstName}
              onChangeText={(text) => setShippingInfo(prev => ({...prev, firstName: text}))}
              autoCapitalize="words"
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>
          
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="Enter last name"
              value={shippingInfo.lastName}
              onChangeText={(text) => setShippingInfo(prev => ({...prev, lastName: text}))}
              autoCapitalize="words"
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter email address"
            value={shippingInfo.email}
            onChangeText={(text) => setShippingInfo(prev => ({...prev, email: text}))}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Enter phone number"
            value={shippingInfo.phone}
            onChangeText={(text) => setShippingInfo(prev => ({...prev, phone: text}))}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Street Address</Text>
          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            placeholder="Enter street address"
            value={shippingInfo.address}
            onChangeText={(text) => setShippingInfo(prev => ({...prev, address: text}))}
            autoCapitalize="words"
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>
        
        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>City</Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="Enter city"
              value={shippingInfo.city}
              onChangeText={(text) => setShippingInfo(prev => ({...prev, city: text}))}
              autoCapitalize="words"
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>
          
          <View style={styles.inputQuarter}>
            <Text style={styles.inputLabel}>State</Text>
            <TextInput
              style={[styles.input, errors.state && styles.inputError]}
              placeholder="State"
              value={shippingInfo.state}
              onChangeText={(text) => setShippingInfo(prev => ({...prev, state: text.toUpperCase()}))}
              autoCapitalize="characters"
              maxLength={2}
            />
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
          </View>
          
          <View style={styles.inputQuarter}>
            <Text style={styles.inputLabel}>ZIP Code</Text>
            <TextInput
              style={[styles.input, errors.zipCode && styles.inputError]}
              placeholder="ZIP"
              value={shippingInfo.zipCode}
              onChangeText={(text) => setShippingInfo(prev => ({...prev, zipCode: text}))}
              keyboardType="numeric"
              maxLength={5}
            />
            {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderPaymentForm = () => (
    <Animated.View style={[
      styles.formSection,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <Text style={styles.sectionTitle}>Payment Information</Text>
      
      <View style={styles.formCard}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Cardholder Name</Text>
          <TextInput
            style={[styles.input, errors.cardholderName && styles.inputError]}
            placeholder="Enter cardholder name"
            value={paymentInfo.cardholderName}
            onChangeText={(text) => setPaymentInfo(prev => ({...prev, cardholderName: text}))}
            autoCapitalize="words"
          />
          {errors.cardholderName && <Text style={styles.errorText}>{errors.cardholderName}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <TextInput
            style={[styles.input, errors.cardNumber && styles.inputError]}
            placeholder="1234 5678 9012 3456"
            value={paymentInfo.cardNumber}
            onChangeText={(text) => {
              const formatted = formatCardNumber(text);
              if (formatted.replace(/\s/g, '').length <= 16) {
                setPaymentInfo(prev => ({...prev, cardNumber: formatted}));
              }
            }}
            keyboardType="numeric"
            maxLength={19}
          />
          {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
        </View>
        
        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>Expiry Date</Text>
            <TextInput
              style={[styles.input, errors.expiryDate && styles.inputError]}
              placeholder="MM/YY"
              value={paymentInfo.expiryDate}
              onChangeText={(text) => {
                const formatted = formatExpiryDate(text);
                if (formatted.length <= 5) {
                  setPaymentInfo(prev => ({...prev, expiryDate: formatted}));
                }
              }}
              keyboardType="numeric"
              maxLength={5}
            />
            {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
          </View>
          
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>CVV</Text>
            <TextInput
              style={[styles.input, errors.cvv && styles.inputError]}
              placeholder="123"
              value={paymentInfo.cvv}
              onChangeText={(text) => setPaymentInfo(prev => ({...prev, cvv: text}))}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
            {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
          </View>
        </View>
        
        <View style={styles.securityNote}>
          <MaterialCommunityIcons name="shield-check" size={16} color={colors.green} />
          <Text style={styles.securityText}>Your payment information is secure and encrypted</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderOrderReview = () => (
    <Animated.View style={[
      styles.reviewSection,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <Text style={styles.sectionTitle}>Review Your Order</Text>
      
      {/* Order Items */}
      <View style={styles.reviewCard}>
        <Text style={styles.reviewCardTitle}>Order Items ({cartItems.length})</Text>
        {cartItems.slice(0, 3).map((item, index) => (
          <View key={item.id} style={styles.reviewItem}>
            <Text style={styles.reviewItemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.reviewItemPrice}>
              {item.quantity}x ${item.price.toFixed(2)}
            </Text>
          </View>
        ))}
        {cartItems.length > 3 && (
          <Text style={styles.moreItemsText}>
            +{cartItems.length - 3} more items
          </Text>
        )}
      </View>
      
      {/* Shipping Address */}
      <View style={styles.reviewCard}>
        <Text style={styles.reviewCardTitle}>Shipping Address</Text>
        <Text style={styles.reviewText}>
          {shippingInfo.firstName} {shippingInfo.lastName}
        </Text>
        <Text style={styles.reviewText}>{shippingInfo.address}</Text>
        <Text style={styles.reviewText}>
          {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
        </Text>
        <Text style={styles.reviewText}>{shippingInfo.phone}</Text>
      </View>
      
      {/* Payment Method */}
      <View style={styles.reviewCard}>
        <Text style={styles.reviewCardTitle}>Payment Method</Text>
        <View style={styles.paymentMethodRow}>
          <MaterialCommunityIcons name="credit-card" size={20} color={colors.slateBlue} />
          <Text style={styles.reviewText}>
            •••• •••• •••• {paymentInfo.cardNumber.slice(-4)}
          </Text>
        </View>
        <Text style={styles.reviewText}>{paymentInfo.cardholderName}</Text>
      </View>
    </Animated.View>
  );

  const renderOrderSummary = () => (
    <Animated.View style={[
      styles.summarySection,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <Text style={styles.summaryTitle}>Order Summary</Text>
      
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({orderSummary.itemCount} items):</Text>
          <Text style={styles.summaryValue}>${orderSummary.subtotal.toFixed(2)}</Text>
        </View>
        
        {orderSummary.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={[styles.summaryValue, styles.discountValue]}>
              -${orderSummary.discount.toFixed(2)}
            </Text>
          </View>
        )}
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping:</Text>
          <Text style={[
            styles.summaryValue, 
            orderSummary.shipping === 0 && styles.freeShipping
          ]}>
            {orderSummary.shipping === 0 ? 'FREE' : `$${orderSummary.shipping.toFixed(2)}`}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax:</Text>
          <Text style={styles.summaryValue}>${orderSummary.tax.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${orderSummary.total.toFixed(2)}</Text>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.slateBlue} />
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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

      {/* Custom Header */}
      <SafeAreaView style={styles.customHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Checkout</Text>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {renderProgressBar()}
        
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 && renderShippingForm()}
          {currentStep === 2 && renderPaymentForm()}
          {currentStep === 3 && renderOrderReview()}
          
          {renderOrderSummary()}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Action Buttons */}
        <Animated.View style={[
          styles.actionSection,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          {currentStep < 3 ? (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>
                {currentStep === 1 ? 'Continue to Payment' : 'Review Order'}
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.primaryButton, processingOrder && styles.disabledButton]}
              onPress={handlePlaceOrder}
              disabled={processingOrder}
            >
              {processingOrder ? (
                <>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={styles.primaryButtonText}>Processing Order...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    Place Order • ${orderSummary.total.toFixed(2)}
                  </Text>
                  <MaterialCommunityIcons name="check" size={20} color={colors.white} />
                </>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
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
    bottom: -100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
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

  // Progress bar
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: colors.burntOrange,
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray,
  },
  progressStepTextActive: {
    color: colors.white,
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: colors.lightGray,
    marginHorizontal: 10,
  },
  progressLineActive: {
    backgroundColor: colors.burntOrange,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '500',
  },
  progressLabelActive: {
    color: colors.burntOrange,
    fontWeight: '600',
  },

  // Scroll content
  scrollContent: {
    flex: 1,
  },

  // Section styling
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  // Form sections
  formSection: {
    marginBottom: 30,
  },
  formCard: {
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

  // Input styling
  inputContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  inputHalf: {
    flex: 1,
  },
  inputQuarter: {
    flex: 0.5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.slateBlue,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.red,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  errorText: {
    fontSize: 12,
    color: colors.red,
    marginTop: 5,
    marginLeft: 5,
  },

  // Security note
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    padding: 12,
    backgroundColor: colors.lightGreen,
    borderRadius: 8,
  },
  securityText: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '500',
  },

  // Review section
  reviewSection: {
    marginBottom: 30,
  },
  reviewCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  reviewCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewItemName: {
    fontSize: 14,
    color: colors.slateBlue,
    flex: 1,
    marginRight: 10,
  },
  reviewItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.burntOrange,
  },
  moreItemsText: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
    marginTop: 5,
  },
  reviewText: {
    fontSize: 14,
    color: colors.slateBlue,
    marginBottom: 4,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },

  // Summary section
  summarySection: {
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  summaryCard: {
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slateBlue,
  },
  discountValue: {
    color: colors.green,
  },
  freeShipping: {
    color: colors.green,
    fontWeight: 'bold',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.burntOrange,
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
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: colors.gray,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});

export default CheckoutScreen; 