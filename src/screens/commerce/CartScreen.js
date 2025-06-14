import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  Image, 
  TextInput,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';

const { width: screenWidth } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const { 
    cartItems, 
    savedItems,
    updateQuantity, 
    removeFromCart, 
    moveToSaved,
    moveToCart,
    removeSavedItem,
    getOrderSummary,
    applyDiscountCode,
    removeDiscountCode,
    appliedDiscount,
    discountCode
  } = useCart();

  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [loading, setLoading] = useState(true);
  const [showSavedItems, setShowSavedItems] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);

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

  const handleRemoveItem = (itemId, itemName) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${itemName}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Move to Saved', 
          onPress: () => {
            const result = moveToSaved(itemId);
            if (result.success) {
              Alert.alert('✓ Moved to Saved', result.message);
            }
          }
        },
        { 
          text: 'Remove', 
          onPress: () => removeFromCart(itemId), 
          style: 'destructive' 
        },
      ]
    );
  };

  const handleQuantityChange = (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      const item = cartItems.find(item => item.id === itemId);
      handleRemoveItem(itemId, item?.name || 'item');
    } else {
      const result = updateQuantity(itemId, newQuantity);
      if (!result.success) {
        Alert.alert('Error', result.message);
      }
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) return;
    
    setApplyingDiscount(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = applyDiscountCode(discountInput.trim());
    
    if (result.success) {
      Alert.alert('✓ Discount Applied', result.message);
      setDiscountInput('');
    } else {
      Alert.alert('Invalid Code', result.message);
    }
    
    setApplyingDiscount(false);
  };

  const handleRemoveDiscount = () => {
    const result = removeDiscountCode();
    if (result.success) {
      Alert.alert('✓ Discount Removed', result.message);
    }
  };

  const renderCartItem = ({ item, index }) => (
    <Animated.View style={[
      styles.cartItemWrapper,
      {
        opacity: fadeAnim,
        transform: [{ 
          translateY: slideAnim.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 50 + (index * 10)],
          })
        }]
      }
    ]}>
      <View style={styles.cartItem}>
        <View style={styles.itemImageContainer}>
          {item.image ? (
            <Image source={item.image} style={styles.productImage} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name="package-variant" size={32} color={colors.gray} />
          )}
          
          {item.isAppExclusive && (
            <View style={styles.exclusiveBadge}>
              <MaterialCommunityIcons name="star" size={10} color={colors.white} />
            </View>
          )}
        </View>
        
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item.id, item.name)}
            >
              <MaterialCommunityIcons name="close" size={20} color={colors.gray} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.itemMeta}>
            {item.size && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="resize" size={14} color={colors.gray} />
                <Text style={styles.metaText}>Size: {item.size}</Text>
              </View>
            )}
            {item.sponsor && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="store" size={14} color={colors.burntOrange} />
                <Text style={styles.sponsorText}>{item.sponsor}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              {item.originalPrice && item.originalPrice > item.price && (
                <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
              )}
            </View>
            <Text style={styles.itemTotal}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.itemActions}>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, item.quantity, -1)}
              >
                <MaterialCommunityIcons name="minus" size={16} color={colors.slateBlue} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{item.quantity}</Text>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item.id, item.quantity, 1)}
              >
                <MaterialCommunityIcons name="plus" size={16} color={colors.slateBlue} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => {
                const result = moveToSaved(item.id);
                if (result.success) {
                  Alert.alert('✓ Saved', result.message);
                }
              }}
            >
              <MaterialCommunityIcons name="heart-outline" size={16} color={colors.burntOrange} />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderSavedItem = ({ item }) => (
    <View style={styles.savedItem}>
      <View style={styles.savedImageContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.savedImage} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name="package-variant" size={24} color={colors.gray} />
        )}
      </View>
      
      <View style={styles.savedDetails}>
        <Text style={styles.savedName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.savedPrice}>${item.price.toFixed(2)}</Text>
      </View>
      
      <View style={styles.savedActions}>
        <TouchableOpacity 
          style={styles.moveToCartButton}
          onPress={() => {
            const result = moveToCart(item.id);
            if (result.success) {
              Alert.alert('✓ Added to Cart', result.message);
            }
          }}
        >
          <MaterialCommunityIcons name="cart-plus" size={16} color={colors.white} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.removeSavedButton}
          onPress={() => removeSavedItem(item.id)}
        >
          <MaterialCommunityIcons name="close" size={16} color={colors.gray} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDiscountSection = () => (
    <Animated.View style={[
      styles.discountSection,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <Text style={styles.discountTitle}>Discount Code</Text>
      
      {appliedDiscount ? (
        <View style={styles.appliedDiscountContainer}>
          <View style={styles.appliedDiscountInfo}>
            <MaterialCommunityIcons name="ticket-percent" size={20} color={colors.green} />
            <View style={styles.discountTextContainer}>
              <Text style={styles.appliedDiscountCode}>{appliedDiscount.code}</Text>
              <Text style={styles.appliedDiscountDescription}>{appliedDiscount.description}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.removeDiscountButton}
            onPress={handleRemoveDiscount}
          >
            <MaterialCommunityIcons name="close" size={16} color={colors.red} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.discountInputContainer}>
          <TextInput
            style={styles.discountInput}
            placeholder="Enter discount code"
            value={discountInput}
            onChangeText={setDiscountInput}
            autoCapitalize="characters"
            returnKeyType="done"
            onSubmitEditing={handleApplyDiscount}
          />
          <TouchableOpacity 
            style={[styles.applyButton, (!discountInput.trim() || applyingDiscount) && styles.disabledButton]}
            onPress={handleApplyDiscount}
            disabled={!discountInput.trim() || applyingDiscount}
          >
            {applyingDiscount ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.applyButtonText}>Apply</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderOrderSummary = () => (
    <Animated.View style={[
      styles.summarySection,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <Text style={styles.summaryTitle}>Order Summary</Text>
      
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
      
      {orderSummary.shipping === 0 && orderSummary.subtotal > 0 && (
        <Text style={styles.freeShippingText}>
          🎉 You qualify for free shipping!
        </Text>
      )}
      
      {orderSummary.shipping > 0 && (
        <Text style={styles.shippingPromo}>
          Add ${(75 - orderSummary.subtotal).toFixed(2)} more for free shipping
        </Text>
      )}
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>${orderSummary.total.toFixed(2)}</Text>
      </View>
      
      <Text style={styles.deliveryText}>
        📦 Estimated delivery: 5-7 business days
      </Text>
    </Animated.View>
  );

  const renderEmptyCart = () => (
    <Animated.View style={[
      styles.emptyCart,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <MaterialCommunityIcons 
        name="cart-outline" 
        size={80} 
        color={colors.gray} 
      />
      <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
      <Text style={styles.emptyCartText}>
        Discover amazing products in our store and start building your fitness journey.
      </Text>
      <TouchableOpacity 
        style={styles.shopButton}
        onPress={() => navigation.navigate('StoreHome')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
        <MaterialCommunityIcons name="arrow-right" size={16} color={colors.white} />
      </TouchableOpacity>
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
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </View>
    );
  }

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

      {/* Custom Header */}
      <SafeAreaView style={styles.customHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Shopping Cart</Text>
            <Text style={styles.headerSubtitle}>
              {orderSummary.itemCount} {orderSummary.itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('StoreHome')}
          >
            <Ionicons name="storefront-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {cartItems.length === 0 ? renderEmptyCart() : (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              style={styles.cartList}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />

            {/* Saved Items Section */}
            {savedItems.length > 0 && (
              <View style={styles.savedItemsSection}>
                <TouchableOpacity 
                  style={styles.savedItemsHeader}
                  onPress={() => setShowSavedItems(!showSavedItems)}
                >
                  <Text style={styles.savedItemsTitle}>
                    Saved Items ({savedItems.length})
                  </Text>
                  <MaterialCommunityIcons 
                    name={showSavedItems ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.slateBlue} 
                  />
                </TouchableOpacity>
                
                {showSavedItems && (
                  <FlatList
                    data={savedItems}
                    renderItem={renderSavedItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.savedItemsList}
                  />
                )}
              </View>
            )}

            {renderDiscountSection()}
            {renderOrderSummary()}

            {/* Checkout Section */}
            <Animated.View style={[
              styles.checkoutSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={() => navigation.navigate('Checkout')}
              >
                <Text style={styles.checkoutButtonText}>
                  Proceed to Checkout • ${orderSummary.total.toFixed(2)}
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={colors.white} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.continueShoppingButton}
                onPress={() => navigation.navigate('StoreHome')}
              >
                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </View>
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },

  // Main content
  mainContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },

  // Cart list
  cartList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemSeparator: {
    height: 15,
  },
  
  // Cart items
  cartItemWrapper: {
    marginBottom: 5,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.lightGray,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.burntOrange,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    gap: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    padding: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.gray,
  },
  sponsorText: {
    fontSize: 12,
    color: colors.burntOrange,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.gray,
    textDecorationLine: 'line-through',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.burntOrange,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    gap: 4,
  },
  saveButtonText: {
    fontSize: 12,
    color: colors.burntOrange,
    fontWeight: '600',
  },

  // Saved items
  savedItemsSection: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  savedItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  savedItemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
  },
  savedItemsList: {
    gap: 15,
    paddingRight: 20,
  },
  savedItem: {
    width: 120,
    backgroundColor: colors.lightGray,
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  savedImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: colors.white,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  savedImage: {
    width: '100%',
    height: '100%',
  },
  savedDetails: {
    alignItems: 'center',
    gap: 2,
  },
  savedName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateBlue,
    textAlign: 'center',
  },
  savedPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.burntOrange,
  },
  savedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  moveToCartButton: {
    backgroundColor: colors.burntOrange,
    borderRadius: 12,
    padding: 6,
  },
  removeSavedButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 6,
  },

  // Discount section
  discountSection: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  discountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 15,
  },
  discountInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  discountInput: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.slateBlue,
  },
  applyButton: {
    backgroundColor: colors.burntOrange,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  disabledButton: {
    backgroundColor: colors.gray,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  appliedDiscountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 15,
  },
  appliedDiscountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discountTextContainer: {
    gap: 2,
  },
  appliedDiscountCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.green,
  },
  appliedDiscountDescription: {
    fontSize: 12,
    color: colors.green,
  },
  removeDiscountButton: {
    padding: 4,
  },

  // Summary section
  summarySection: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 15,
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
  freeShippingText: {
    fontSize: 12,
    color: colors.green,
    textAlign: 'center',
    marginVertical: 8,
    fontWeight: '500',
  },
  shippingPromo: {
    fontSize: 12,
    color: colors.burntOrange,
    textAlign: 'center',
    marginVertical: 8,
    fontWeight: '500',
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
  deliveryText: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 12,
  },

  // Checkout section
  checkoutSection: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  checkoutButton: {
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
  checkoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  continueShoppingButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  continueShoppingText: {
    color: colors.slateBlue,
    fontSize: 16,
    fontWeight: '500',
  },

  // Empty cart
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  shopButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen; 