import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  Image, 
  Dimensions, 
  Alert,
  Animated,
  ActivityIndicator,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { colors } from '../../theme/colors';
import { sponsors, products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProductDetailScreen = ({ navigation, route }) => {
  const { product } = route.params || {};
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Cart context with comprehensive error handling
  const cartContext = useCart();
  const { 
    addToCart, 
    isItemInCart, 
    getItemQuantityInCart,
    loading: cartLoading = false 
  } = cartContext || {};

  // State management
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Safe checks for product data
  if (!product) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.slateBlue} />
        <LinearGradient
          colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <SafeAreaView style={styles.errorContent}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.white} />
          <Text style={styles.errorText}>Product not found</Text>
          <Text style={styles.errorSubtext}>The product you're looking for doesn't exist or has been removed.</Text>
          <TouchableOpacity 
            style={styles.errorButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.white} />
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  // Related products with better filtering
  const relatedProducts = products.filter(
    p => (p.sponsor === product.sponsor || p.category === product.category) && 
         p.id !== product.id
  ).slice(0, 4);

  // Safe cart functions with fallbacks
  const isInCart = typeof isItemInCart === 'function' ? isItemInCart(product.id, selectedSize) : false;
  const cartQuantity = typeof getItemQuantityInCart === 'function' ? getItemQuantityInCart(product.id, selectedSize) : 0;

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageParallax = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  // Render functions
  const renderImage = ({ item, index }) => (
    <View style={styles.imageContainer}>
      <Animated.Image 
        source={item} 
        style={[
          styles.carouselImage,
          { transform: [{ translateY: imageParallax }] }
        ]} 
        resizeMode="cover"
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
      />
      {imageLoading && (
        <View style={styles.imageLoadingOverlay}>
          <ActivityIndicator size="large" color={colors.burntOrange} />
        </View>
      )}
    </View>
  );

  const renderImageIndicator = () => (
    <View style={styles.imageIndicatorContainer}>
      {product.images?.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.imageIndicator,
            currentImageIndex === index && styles.activeImageIndicator,
            currentImageIndex === index && {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        />
      ))}
    </View>
  );

  const renderSize = (size) => (
    <TouchableOpacity
      key={size}
      style={[
        styles.optionButton, 
        selectedSize === size && styles.selectedOptionButton
      ]}
      onPress={() => setSelectedSize(size)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.optionText, 
        selectedSize === size && styles.selectedOptionText
      ]}>
        {size}
      </Text>
    </TouchableOpacity>
  );

  const renderColor = (color) => (
    <TouchableOpacity
      key={color}
      style={[
        styles.optionButton, 
        selectedColor === color && styles.selectedOptionButton
      ]}
      onPress={() => setSelectedColor(color)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.optionText, 
        selectedColor === color && styles.selectedOptionText
      ]}>
        {color}
      </Text>
    </TouchableOpacity>
  );

  const renderRelatedProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.relatedProductCard}
      onPress={() => navigation.push('ProductDetail', { product: item })}
      activeOpacity={0.8}
    >
      <View style={styles.relatedProductImageContainer}>
        <Image 
          source={item.images[0]} 
          style={styles.relatedProductImage} 
          resizeMode="cover" 
        />
        {item.isAppExclusive && (
          <View style={styles.exclusiveBadgeSmall}>
            <MaterialCommunityIcons name="star" size={10} color={colors.white} />
          </View>
        )}
      </View>
      <Text style={styles.relatedProductName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.relatedProductPrice}>
        ${item.price.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  // Action handlers
  const handleAddToCart = async () => {
    if (!product.inStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }

    if (!addToCart || typeof addToCart !== 'function') {
      Alert.alert('Error', 'Cart functionality is not available. Please try again later.');
      return;
    }

    setAddingToCart(true);
    
    try {
      const result = addToCart(product, selectedSize, quantity);
      
      if (result?.success !== false) {
        Alert.alert(
          '✓ Added to Cart!',
          `${product.name} has been added to your cart.`,
          [
            { text: 'Continue Shopping', style: 'default' },
            { 
              text: 'View Cart', 
              onPress: () => navigation.navigate('Cart'),
              style: 'default'
            },
          ]
        );
      } else {
        throw new Error('Failed to add item to cart');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
      console.error('Add to cart error:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product.inStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }

    if (!addToCart || typeof addToCart !== 'function') {
      Alert.alert('Error', 'Cart functionality is not available. Please try again later.');
      return;
    }

    setAddingToCart(true);
    
    try {
      addToCart(product, selectedSize, quantity);
      navigation.navigate('Cart');
    } catch (error) {
      Alert.alert('Error', 'Failed to proceed to checkout. Please try again.');
      console.error('Buy now error:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
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
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['rgba(74, 85, 104, 0.95)', 'rgba(230, 126, 34, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        />
        <SafeAreaView style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {product.name}
          </Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="bag-outline" size={24} color={colors.white} />
            {cartQuantity > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{cartQuantity}</Text>
              </View>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <FlatList
            data={product.images || []}
            renderItem={renderImage}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
            style={styles.imageCarousel}
          />
          
          {product.images?.length > 1 && renderImageIndicator()}
          
          {/* Floating Navigation */}
          <View style={styles.floatingNavigation}>
            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color={colors.slateBlue} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={() => navigation.navigate('Cart')}
            >
              <Ionicons name="bag-outline" size={20} color={colors.slateBlue} />
              {cartQuantity > 0 && (
                <View style={styles.floatingBadge}>
                  <Text style={styles.floatingBadgeText}>{cartQuantity}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <Animated.View style={[styles.mainContent, { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }]}>
          {/* Product Header */}
          <View style={styles.productHeader}>
            <View style={styles.productTitleRow}>
              <View style={styles.productTitleContainer}>
                <Text style={styles.productName}>{product.name}</Text>
                <View style={styles.badgeRow}>
                  {product.isAppExclusive && (
                    <View style={styles.exclusiveBadge}>
                      <MaterialCommunityIcons name="star" size={12} color={colors.white} />
                      <Text style={styles.exclusiveText}>EXCLUSIVE</Text>
                    </View>
                  )}
                  <View style={[styles.stockBadge, { 
                    backgroundColor: product.inStock ? colors.lightGreen : colors.lightRed 
                  }]}>
                    <View style={[styles.stockDot, { 
                      backgroundColor: product.inStock ? colors.green : colors.red 
                    }]} />
                    <Text style={[styles.stockText, { 
                      color: product.inStock ? colors.green : colors.red 
                    }]}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Text>
                  </View>
                </View>
              </View>
              
              {product.sponsor && sponsors[product.sponsor] && (
                <View style={styles.sponsorContainer}>
                  <Image 
                    source={sponsors[product.sponsor].logo} 
                    style={styles.sponsorLogo} 
                    resizeMode="contain" 
                  />
                </View>
              )}
            </View>
            
            {/* Price Section */}
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
                    <View style={styles.saveBadge}>
                      <Text style={styles.saveText}>
                        Save ${(product.originalPrice - product.price).toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
              
              {product.limitedQuantity && product.inStock && (
                <View style={styles.urgencyContainer}>
                  <MaterialCommunityIcons name="fire" size={16} color={colors.red} />
                  <Text style={styles.urgencyText}>
                    Only {product.availableQuantity || product.limitedQuantity} left in stock!
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {product.colors && product.colors.length > 0 && (
              <View style={styles.optionSection}>
                <Text style={styles.optionTitle}>
                  Color: <Text style={styles.optionSelected}>{selectedColor}</Text>
                </Text>
                <View style={styles.optionGrid}>
                  {product.colors.map(renderColor)}
                </View>
              </View>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <View style={styles.optionSection}>
                <View style={styles.optionTitleRow}>
                  <Text style={styles.optionTitle}>
                    Size: <Text style={styles.optionSelected}>{selectedSize}</Text>
                  </Text>
                  <TouchableOpacity>
                    <Text style={styles.sizeGuide}>Size Guide</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.optionGrid}>
                  {product.sizes.map(renderSize)}
                </View>
              </View>
            )}

            {/* Quantity */}
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>Quantity</Text>
              <View style={styles.quantityRow}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <MaterialCommunityIcons 
                      name="minus" 
                      size={20} 
                      color={quantity <= 1 ? colors.lightGray : colors.slateBlue} 
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityText}>{quantity}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(1)}
                  >
                    <MaterialCommunityIcons 
                      name="plus" 
                      size={20} 
                      color={colors.slateBlue} 
                    />
                  </TouchableOpacity>
                </View>
                
                {isInCart && cartQuantity > 0 && (
                  <View style={styles.cartIndicator}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={colors.green} />
                    <Text style={styles.cartIndicatorText}>
                      {cartQuantity} in cart
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.addToCartButton, 
                !product.inStock && styles.disabledButton
              ]}
              onPress={handleAddToCart}
              disabled={!product.inStock || addingToCart || cartLoading}
              activeOpacity={0.8}
            >
              {addingToCart ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <MaterialCommunityIcons 
                    name={isInCart ? "cart-check" : "cart-plus"} 
                    size={20} 
                    color={colors.white} 
                  />
                  <Text style={styles.buttonText}>
                    {!product.inStock ? 'Out of Stock' : 
                     isInCart ? 'Add More' : 'Add to Cart'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            {product.inStock && (
              <TouchableOpacity
                style={[styles.buyNowButton, addingToCart && styles.disabledButton]}
                onPress={handleBuyNow}
                disabled={addingToCart || cartLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Buy Now</Text>
                <MaterialCommunityIcons name="lightning-bolt" size={18} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>

          {/* Product Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="truck-delivery" size={24} color={colors.burntOrange} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Free Shipping</Text>
                <Text style={styles.featureSubtitle}>On orders over $75</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="shield-check" size={24} color={colors.burntOrange} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Returns</Text>
                <Text style={styles.featureSubtitle}>30-day return policy</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="help-circle" size={24} color={colors.burntOrange} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Support</Text>
                <Text style={styles.featureSubtitle}>Size guide & product care</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>You Might Also Like</Text>
            <FlatList
              data={relatedProducts}
              renderItem={renderRelatedProduct}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
            />
          </View>
        )}
        
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
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
  
  // Error state
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: colors.lightGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  errorButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: 100,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginHorizontal: 15,
  },
  headerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
  },
  
  // Hero section
  heroSection: {
    height: 400,
    position: 'relative',
    backgroundColor: colors.white,
  },
  imageCarousel: {
    flex: 1,
  },
  imageContainer: {
    width: screenWidth,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  carouselImage: {
    width: screenWidth,
    height: 400,
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  imageIndicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  activeImageIndicator: {
    backgroundColor: colors.burntOrange,
    width: 24,
  },
  
  // Floating navigation
  floatingNavigation: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  
  // Main content
  mainContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  
  // Product header
  productHeader: {
    marginBottom: 25,
  },
  productTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  productTitleContainer: {
    flex: 1,
    marginRight: 15,
  },
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.slateBlue,
    lineHeight: 34,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  exclusiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  exclusiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sponsorContainer: {
    padding: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 15,
  },
  sponsorLogo: {
    width: 50,
    height: 50,
  },
  
  // Price section
  priceContainer: {
    gap: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.burntOrange,
  },
  originalPrice: {
    fontSize: 20,
    color: colors.gray,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: colors.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgencyText: {
    fontSize: 14,
    color: colors.red,
    fontWeight: '600',
  },
  
  // Description
  descriptionContainer: {
    marginBottom: 30,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.slateBlue,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: colors.gray,
    lineHeight: 24,
  },
  
  // Options
  optionsContainer: {
    marginBottom: 30,
  },
  optionSection: {
    marginBottom: 25,
  },
  optionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.slateBlue,
  },
  optionSelected: {
    fontWeight: '400',
    color: colors.burntOrange,
  },
  sizeGuide: {
    fontSize: 14,
    color: colors.burntOrange,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: colors.slateBlue,
    borderColor: colors.slateBlue,
  },
  optionText: {
    fontSize: 14,
    color: colors.slateBlue,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.white,
  },
  
  // Quantity
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 25,
    padding: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityButtonDisabled: {
    backgroundColor: colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  quantityDisplay: {
    paddingHorizontal: 20,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  cartIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartIndicatorText: {
    fontSize: 14,
    color: colors.green,
    fontWeight: '500',
  },
  
  // Actions
  actionContainer: {
    gap: 12,
    marginBottom: 30,
  },
  addToCartButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.burntOrange,
    paddingVertical: 18,
    borderRadius: 25,
    gap: 10,
    shadowColor: colors.burntOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buyNowButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.slateBlue,
    paddingVertical: 18,
    borderRadius: 25,
    gap: 10,
    shadowColor: colors.slateBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Features
  featuresContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 14,
    color: colors.gray,
  },
  
  // Related products
  relatedSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  relatedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  relatedList: {
    gap: 15,
    paddingRight: 20,
  },
  relatedProductCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 15,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  relatedProductImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  relatedProductImage: {
    width: '100%',
    height: 90,
    borderRadius: 15,
  },
  exclusiveBadgeSmall: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.burntOrange,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  relatedProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.burntOrange,
    textAlign: 'center',
  },
  
  // Bottom spacer
  bottomSpacer: {
    height: 40,
  },
});

export default ProductDetailScreen; 