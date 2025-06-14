import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  Image, 
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { products, categories, sponsors, getProductsByCategory, getFeaturedProducts, getProductsBySponsor } from '../../data/products';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StoreHomeScreen = ({ navigation }) => {
  const { cartItems, getCartItemCount, addToCart, isItemInCart } = useCart();
  
  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  // Hero banner images
  const heroBanners = [
    {
      id: 'hero-1',
      image: require('../../assets/images/merch/chilly goat/Justin-Medeiros-4_1024x1024.webp'),
      title: "Shop Justin's Official Merch & Partner Gear",
      subtitle: 'Train. Recover. Repeat.',
      action: 'Shop Now',
    },
  ];

  const featuredProducts = getFeaturedProducts();
  const filteredProducts = getProductsByCategory(selectedCategory);

  // Filter products by search query
  const searchFilteredProducts = searchQuery 
    ? filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sponsor && sponsors[product.sponsor]?.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : filteredProducts;

  const handleQuickAdd = (product) => {
    const result = addToCart(product, null, 1);
    if (result.success) {
      Alert.alert('✓ Added to Cart', `${product.name} has been added to your cart!`);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const renderCustomHeader = () => (
    <Animated.View style={[
      styles.customHeader,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Store</Text>
          <Text style={styles.headerSubtitle}>Premium fitness gear</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name="search" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={24} color={colors.white} />
            {getCartItemCount() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {showSearch && (
        <Animated.View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.gray}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={20} color={colors.gray} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );

  const renderHeroBanner = (banner) => (
    <Animated.View 
      key={banner.id} 
      style={[
        styles.heroBanner,
        { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
      ]}
    >
      <Image source={banner.image} style={styles.heroImage} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.heroOverlay}
      />
      <View style={styles.heroTextContainer}>
        <Text style={styles.heroTitle}>{banner.title}</Text>
        <Text style={styles.heroSubtitle}>{banner.subtitle}</Text>
        <TouchableOpacity style={styles.heroButton}>
          <Text style={styles.heroButtonText}>{banner.action}</Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderCategory = (category, index) => (
    <Animated.View
      key={category.key}
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.categoryTile,
          selectedCategory === category.key && styles.activeCategoryTile
        ]}
        onPress={() => setSelectedCategory(category.key)}
      >
        <View style={[
          styles.categoryIconContainer,
          selectedCategory === category.key && styles.activeCategoryIconContainer
        ]}>
          <MaterialCommunityIcons
            name={category.icon}
            size={24}
            color={selectedCategory === category.key ? colors.white : colors.slateBlue}
          />
        </View>
        <Text style={[
          styles.categoryLabel,
          selectedCategory === category.key && styles.activeCategoryLabel
        ]}>
          {category.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderProduct = ({ item, index }) => (
    <Animated.View style={[
      styles.productCardWrapper,
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
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={item.images[0]} 
            style={styles.productImage}
            resizeMode="cover"
          />
          
          {/* Badges */}
          <View style={styles.productBadges}>
            {item.isAppExclusive && (
              <View style={styles.exclusiveBadge}>
                <MaterialCommunityIcons name="star" size={12} color={colors.white} />
                <Text style={styles.exclusiveText}>EXCLUSIVE</Text>
              </View>
            )}
            {item.sponsor && (
              <View style={styles.sponsorBadge}>
                <Text style={styles.sponsorText}>{sponsors[item.sponsor]?.name || item.sponsor}</Text>
              </View>
            )}
          </View>

          {/* Quick Add Button */}
          <TouchableOpacity 
            style={styles.quickAddButton}
            onPress={() => handleQuickAdd(item)}
          >
            <MaterialCommunityIcons 
              name={isItemInCart(item.id) ? "check" : "plus"} 
              size={16} 
              color={colors.white} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.productPriceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
              {item.originalPrice && item.originalPrice > item.price && (
                <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
              )}
            </View>
            {item.originalPrice && item.originalPrice > item.price && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>
                  SAVE ${(item.originalPrice - item.price).toFixed(0)}
                </Text>
              </View>
            )}
          </View>
          
          {/* Stock indicator */}
          <View style={styles.stockIndicator}>
            <View style={[
              styles.stockDot, 
              { backgroundColor: item.inStock ? colors.green : colors.red }
            ]} />
            <Text style={styles.stockText}>
              {item.inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSponsorSection = (sponsorKey, index) => {
    const sponsor = sponsors[sponsorKey];
    const sponsorProducts = getProductsBySponsor(sponsorKey);
    if (sponsorProducts.length === 0) return null;
    
    return (
      <Animated.View 
        key={sponsorKey} 
        style={[
          styles.sponsorSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.sponsorHeader}>
          <View style={styles.sponsorLogoContainer}>
            <Image source={sponsor.logo} style={styles.sponsorLogo} resizeMode="contain" />
          </View>
          <View style={styles.sponsorHeaderText}>
            <Text style={styles.sponsorName}>{sponsor.name}</Text>
            <Text style={styles.sponsorDescription}>{sponsor.description}</Text>
            <Text style={styles.productCount}>{sponsorProducts.length} products</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('SponsorProducts', { sponsor: sponsorKey })}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={colors.burntOrange} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={sponsorProducts.slice(0, 4)}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sponsorProducts}
          ItemSeparatorComponent={() => <View style={styles.productSeparator} />}
        />
      </Animated.View>
    );
  };

  const renderSectionHeader = (title, subtitle) => (
    <Animated.View style={[
      styles.sectionHeader,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
    </Animated.View>
  );

  const ListHeader = useCallback(() => (
    <View style={styles.listHeaderContainer}>
      {/* Hero Banner */}
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false} 
        style={styles.heroScroll}
      >
        {heroBanners.map(renderHeroBanner)}
      </ScrollView>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.categoriesTitle}>Shop by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categories}>
            {categories.map((category, index) => renderCategory(category, index))}
          </View>
        </ScrollView>
      </View>

      {/* Featured Products */}
      {renderSectionHeader('Featured Products', 'Hand-picked favorites')}
      <FlatList
        data={featuredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredProducts}
        ItemSeparatorComponent={() => <View style={styles.productSeparator} />}
      />

      {/* Sponsor Sections */}
      {Object.keys(sponsors).map((sponsorKey, index) => renderSponsorSection(sponsorKey, index))}

      {/* All Products Grid Title */}
      {renderSectionHeader(
        searchQuery ? `Search Results (${searchFilteredProducts.length})` : 'All Products',
        searchQuery ? `Results for "${searchQuery}"` : 'Complete collection'
      )}
    </View>
  ), [selectedCategory, searchQuery, fadeAnim, slideAnim]);

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
          <MaterialCommunityIcons name="loading" size={40} color={colors.white} />
          <Text style={styles.loadingText}>Loading store...</Text>
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
      <View style={styles.decorativeCircle3} />

      {/* Custom Header */}
      <SafeAreaView>
        {renderCustomHeader()}
      </SafeAreaView>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <FlatList
          data={searchFilteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productsGrid}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.gridItemSeparator} />}
        />
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
    top: 300,
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.burntOrange,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },

  // Search
  searchContainer: {
    marginTop: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.slateBlue,
  },

  // Main content
  mainContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },

  // List header
  listHeaderContainer: {
    paddingBottom: 20,
  },

  // Hero banner
  heroScroll: {
    marginBottom: 30,
  },
  heroBanner: {
    width: screenWidth - 40,
    height: 200,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroTextContainer: {
    position: 'absolute',
    left: 24,
    bottom: 24,
    right: 24,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 28,
  },
  heroSubtitle: {
    color: colors.white,
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 15,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Categories
  categoriesSection: {
    marginBottom: 30,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
  },
  categoryTile: {
    alignItems: 'center',
    minWidth: 80,
    paddingVertical: 15,
  },
  activeCategoryTile: {
    // No additional styling needed
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeCategoryIconContainer: {
    backgroundColor: colors.burntOrange,
  },
  categoryLabel: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeCategoryLabel: {
    color: colors.burntOrange,
    fontWeight: 'bold',
  },

  // Section headers
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitleContainer: {
    // No additional styling needed
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
  },

  // Featured products
  featuredProducts: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },

  // Sponsor sections
  sponsorSection: {
    marginBottom: 30,
  },
  sponsorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sponsorLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sponsorLogo: {
    width: 35,
    height: 35,
  },
  sponsorHeaderText: {
    flex: 1,
  },
  sponsorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 2,
  },
  sponsorDescription: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
  },
  productCount: {
    fontSize: 11,
    color: colors.burntOrange,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    gap: 4,
  },
  viewAllText: {
    color: colors.burntOrange,
    fontWeight: '600',
    fontSize: 12,
  },
  sponsorProducts: {
    paddingHorizontal: 20,
  },

  // Products grid
  productsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  gridItemSeparator: {
    height: 15,
  },
  productSeparator: {
    width: 15,
  },

  // Product cards
  productCardWrapper: {
    marginBottom: 5,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 15,
    width: (screenWidth - 60) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  productImageContainer: {
    height: 140,
    backgroundColor: colors.lightGray,
    borderRadius: 15,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exclusiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  exclusiveText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: 'bold',
  },
  sponsorBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sponsorText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: '600',
  },
  quickAddButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.burntOrange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    gap: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slateBlue,
    lineHeight: 18,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.burntOrange,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.gray,
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: colors.green,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: 'bold',
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 11,
    color: colors.gray,
    fontWeight: '500',
  },
});

export default StoreHomeScreen; 