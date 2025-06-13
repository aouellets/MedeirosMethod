import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { products, categories, sponsors, getProductsByCategory, getFeaturedProducts, getProductsBySponsor } from '../../data/products';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const { width, height } = Dimensions.get('window');

const StoreHomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Hero banner images (could be a carousel in the future)
  const heroBanners = [
    {
      id: 'hero-1',
      image: require('../../assets/images/merch/chilly goat/Justin-Medeiros-4_1024x1024.webp'),
      title: "Shop Justin's Official Merch & Partner Gear",
      subtitle: 'Train. Recover. Repeat.',
    },
  ];

  const featuredProducts = getFeaturedProducts();
  const filteredProducts = getProductsByCategory(selectedCategory);

  const renderHeroBanner = (banner) => (
    <View key={banner.id} style={styles.heroBanner}>
      <Image source={banner.image} style={styles.heroImage} resizeMode="cover" />
      <View style={styles.heroOverlay} />
      <View style={styles.heroTextContainer}>
        <Text style={styles.heroTitle}>{banner.title}</Text>
        <Text style={styles.heroSubtitle}>{banner.subtitle}</Text>
      </View>
    </View>
  );

  const renderCategory = (category) => (
    <TouchableOpacity
      key={category.key}
      style={[
        styles.categoryTile,
        selectedCategory === category.key && styles.activeCategoryTile
      ]}
      onPress={() => setSelectedCategory(category.key)}
    >
      <MaterialCommunityIcons
        name={category.icon}
        size={28}
        color={selectedCategory === category.key ? colors.boneWhite : colors.slateBlue}
        style={styles.categoryIcon}
      />
      <Text style={[
        styles.categoryLabel,
        selectedCategory === category.key && styles.activeCategoryLabel
      ]}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.productImage}>
        <Image 
          source={item.images[0]} 
          style={styles.productImageContent}
          resizeMode="cover"
        />
        {item.sponsor && (
          <View style={styles.sponsorBadge}>
            <Text style={styles.sponsorText}>{item.sponsor}</Text>
          </View>
        )}
      </View>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const renderSponsorSection = (sponsorKey) => {
    const sponsor = sponsors[sponsorKey];
    const sponsorProducts = getProductsBySponsor(sponsorKey);
    if (sponsorProducts.length === 0) return null;
    return (
      <View key={sponsorKey} style={styles.sponsorSection}>
        <View style={styles.sponsorHeader}>
          <Image source={sponsor.logo} style={styles.sponsorLogo} resizeMode="contain" />
          <View style={styles.sponsorHeaderText}>
            <Text style={styles.sponsorName}>{sponsor.name}</Text>
            <Text style={styles.sponsorDescription}>{sponsor.description}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SponsorProducts', { sponsor: sponsorKey })}>
            <Text style={styles.viewAllBtn}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={sponsorProducts.slice(0, 4)}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sponsorProducts}
        />
      </View>
    );
  };

  // Compose the header for the main FlatList
  const ListHeader = useCallback(() => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Store</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Banner */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.heroScroll}>
        {heroBanners.map(renderHeroBanner)}
      </ScrollView>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categories}>
            {categories.map(renderCategory)}
          </View>
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Featured</Text>
      </View>
      <FlatList
        data={featuredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredProducts}
      />

      {/* Sponsor Sections */}
      {Object.keys(sponsors).map(renderSponsorSection)}

      {/* All Products Grid Title */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>All Products</Text>
      </View>
    </>
  ), [selectedCategory]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.slateBlue, colors.burntOrange, colors.slateBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      {/* Decorative Elements */}
      <View style={styles.decorativeContainer}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsGrid}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
      />
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
    right: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: colors.burntOrange,
    opacity: 0.1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.2,
    left: -width * 0.4,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: colors.white,
    opacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.boneWhite,
  },
  cartIcon: {
    fontSize: 24,
  },
  heroScroll: {
    marginBottom: 20,
  },
  heroBanner: {
    width: screenWidth - 40,
    height: 180,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroTextContainer: {
    position: 'absolute',
    left: 24,
    bottom: 24,
    zIndex: 2,
  },
  heroTitle: {
    color: colors.boneWhite,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: colors.boneWhite,
    fontSize: 14,
    opacity: 0.9,
  },
  categoriesSection: {
    marginBottom: 10,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryTile: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginRight: 10,
  },
  activeCategoryTile: {
    backgroundColor: colors.burntOrange,
    borderColor: colors.burntOrange,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '600',
  },
  activeCategoryLabel: {
    color: colors.boneWhite,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.boneWhite,
  },
  featuredProducts: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 10,
  },
  sponsorSection: {
    marginBottom: 30,
  },
  sponsorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sponsorLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  sponsorHeaderText: {
    flex: 1,
  },
  sponsorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.boneWhite,
    marginBottom: 2,
  },
  sponsorDescription: {
    fontSize: 12,
    color: colors.boneWhite,
  },
  viewAllBtn: {
    color: colors.burntOrange,
    fontWeight: '600',
    fontSize: 14,
  },
  sponsorProducts: {
    paddingHorizontal: 20,
    gap: 12,
  },
  productsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    width: (screenWidth - 60) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 10,
  },
  productImage: {
    height: 120,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  productImageContent: {
    width: '100%',
    height: '100%',
  },
  sponsorBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sponsorText: {
    fontSize: 10,
    color: colors.boneWhite,
    fontWeight: '600',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.burntOrange,
  },
});

export default StoreHomeScreen; 