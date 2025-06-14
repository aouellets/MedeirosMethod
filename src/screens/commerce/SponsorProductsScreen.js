import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { sponsors, getProductsBySponsor } from '../../data/products';

const { width: screenWidth } = Dimensions.get('window');

const SponsorProductsScreen = ({ navigation, route }) => {
  const { sponsor } = route.params;
  const sponsorData = sponsor === 'all' ? null : sponsors[sponsor];
  const products = sponsor === 'all' 
    ? Object.values(sponsors).flatMap(s => getProductsBySponsor(s.name))
    : getProductsBySponsor(sponsor);

  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and start animations
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

  const renderProduct = ({ item, index }) => {
    return (
      <View style={styles.productCardWrapper}>
        <TouchableOpacity 
          style={styles.productCard}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
          activeOpacity={0.8}
        >
          <View style={styles.productImageContainer}>
            <Image 
              source={item.images[0]} 
              style={styles.productImage}
              resizeMode="cover"
            />
            
            {/* Product badges */}
            <View style={styles.badgeContainer}>
              {item.isAppExclusive && (
                <View style={styles.exclusiveBadge}>
                  <MaterialCommunityIcons name="star" size={10} color={colors.white} />
                  <Text style={styles.exclusiveText}>EXCLUSIVE</Text>
                </View>
              )}
              
              {item.sponsor && (
                <View style={styles.sponsorBadge}>
                  <Text style={styles.sponsorText}>
                    {sponsors[item.sponsor]?.name || item.sponsor}
                  </Text>
                </View>
              )}
            </View>

            {/* Stock indicator */}
            <View style={[styles.stockIndicator, { 
              backgroundColor: item.inStock ? colors.lightGreen : colors.lightRed 
            }]}>
              <View style={[styles.stockDot, { 
                backgroundColor: item.inStock ? colors.green : colors.red 
              }]} />
            </View>
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
              {item.originalPrice && item.originalPrice > item.price && (
                <>
                  <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveText}>
                      -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                    </Text>
                  </View>
                </>
              )}
            </View>

            {item.limitedQuantity && item.inStock && (
              <View style={styles.urgencyContainer}>
                <MaterialCommunityIcons name="fire" size={12} color={colors.red} />
                <Text style={styles.urgencyText}>Limited stock!</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <Animated.View style={[
      styles.headerSection,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      {sponsorData ? (
        // Individual sponsor header
        <View style={styles.sponsorHeaderContent}>
          <View style={styles.sponsorLogoContainer}>
            <Image 
              source={sponsorData.logo} 
              style={styles.sponsorLogo} 
              resizeMode="contain" 
            />
          </View>
          
          <View style={styles.sponsorInfo}>
            <Text style={styles.sponsorName}>{sponsorData.name}</Text>
            <Text style={styles.sponsorDescription}>{sponsorData.description}</Text>
            
            <View style={styles.sponsorStats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="package-variant" size={16} color={colors.burntOrange} />
                <Text style={styles.statText}>{products.length} Products</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="star" size={16} color={colors.burntOrange} />
                <Text style={styles.statText}>Premium Partner</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        // All partners header
        <View style={styles.allPartnersHeader}>
          <View style={styles.allPartnersIconContainer}>
            <MaterialCommunityIcons name="store-outline" size={32} color={colors.burntOrange} />
          </View>
          
          <View style={styles.allPartnersInfo}>
            <Text style={styles.allPartnersTitle}>Partner Products</Text>
            <Text style={styles.allPartnersSubtitle}>
              Discover premium gear from our trusted partners
            </Text>
            
            <View style={styles.allPartnersStats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="package-variant" size={16} color={colors.burntOrange} />
                <Text style={styles.statText}>{products.length} Products</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="handshake" size={16} color={colors.burntOrange} />
                <Text style={styles.statText}>{Object.keys(sponsors).length} Partners</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="package-variant-closed" size={64} color={colors.gray} />
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptySubtitle}>
        {sponsorData 
          ? `${sponsorData.name} doesn't have any products available right now.`
          : 'No partner products are currently available.'
        }
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.emptyButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
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
          <Text style={styles.loadingText}>Loading products...</Text>
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
      <SafeAreaView style={styles.customHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {sponsorData ? sponsorData.name : 'Partner Products'}
          </Text>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="bag-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        {products.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          />
        )}
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

  // Header section
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  
  // Sponsor header
  sponsorHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sponsorLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  sponsorLogo: {
    width: 60,
    height: 60,
  },
  sponsorInfo: {
    flex: 1,
  },
  sponsorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 6,
  },
  sponsorDescription: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: 15,
  },
  sponsorStats: {
    flexDirection: 'row',
    gap: 20,
  },
  
  // All partners header
  allPartnersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  allPartnersIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  allPartnersInfo: {
    flex: 1,
  },
  allPartnersTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 6,
  },
  allPartnersSubtitle: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: 15,
  },
  allPartnersStats: {
    flexDirection: 'row',
    gap: 20,
  },
  
  // Stats
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: colors.slateBlue,
    fontWeight: '600',
  },

  // Products list
  productsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  itemSeparator: {
    height: 20,
  },
  
  // Product cards
  productCardWrapper: {
    width: (screenWidth - 60) / 2, // Account for padding and gap
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  productImageContainer: {
    height: 140,
    borderRadius: 15,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  
  // Product badges
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    fontSize: 8,
    color: colors.white,
    fontWeight: 'bold',
  },
  sponsorBadge: {
    backgroundColor: 'rgba(74, 85, 104, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sponsorText: {
    fontSize: 8,
    color: colors.white,
    fontWeight: '600',
  },
  stockIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Product info
  productInfo: {
    gap: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slateBlue,
    lineHeight: 18,
    minHeight: 36, // Ensure consistent height
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  saveBadge: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveText: {
    fontSize: 10,
    color: colors.green,
    fontWeight: 'bold',
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgencyText: {
    fontSize: 10,
    color: colors.red,
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SponsorProductsScreen; 