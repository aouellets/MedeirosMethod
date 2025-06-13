import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { sponsors, products } from '../../data/products';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;
const { width, height } = Dimensions.get('window');

const ProductDetailScreen = ({ navigation, route }) => {
  const { product } = route.params || {};
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : null);
  const [quantity, setQuantity] = useState(1);

  // Related products (same sponsor or category, not the current product)
  const relatedProducts = products.filter(
    p => (p.sponsor === product.sponsor || p.category === product.category) && p.id !== product.id
  ).slice(0, 4);

  const renderImage = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image source={item} style={styles.carouselImage} resizeMode="cover" />
    </View>
  );

  const renderSize = (size) => (
    <TouchableOpacity
      key={size}
      style={[styles.sizeButton, selectedSize === size && styles.selectedSizeButton]}
      onPress={() => setSelectedSize(size)}
    >
      <Text style={[styles.sizeText, selectedSize === size && styles.selectedSizeText]}>{size}</Text>
    </TouchableOpacity>
  );

  const renderRelatedProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.relatedProductCard}
      onPress={() => navigation.push('ProductDetail', { product: item })}
    >
      <Image source={item.images[0]} style={styles.relatedProductImage} resizeMode="cover" />
      <Text style={styles.relatedProductName}>{item.name}</Text>
      <Text style={styles.relatedProductPrice}>${item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const handleAddToCart = () => {
    // TODO: Add to cart logic
    navigation.navigate('Cart', {
      addedProduct: { ...product, selectedSize, quantity }
    });
  };

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
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <FlatList
          data={product.images || []}
          renderItem={renderImage}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageCarousel}
        />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.productName}>{product.name}</Text>
            {product.sponsor && sponsors[product.sponsor] && (
              <Image source={sponsors[product.sponsor].logo} style={styles.sponsorLogo} resizeMode="contain" />
            )}
          </View>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          {/* Sizes */}
          {product.sizes && (
            <View style={styles.optionsSection}>
              <Text style={styles.optionTitle}>Size</Text>
              <View style={styles.sizeOptions}>
                {product.sizes.map(renderSize)}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.quantitySection}>
            <Text style={styles.optionTitle}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart */}
          <TouchableOpacity
            style={[styles.addToCartButton, !product.inStock && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={!product.inStock}
          >
            <Text style={styles.addToCartText}>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</Text>
          </TouchableOpacity>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related Products</Text>
            <FlatList
              data={relatedProducts}
              renderItem={renderRelatedProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
            />
          </View>
        )}
      </ScrollView>
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
  imageCarousel: {
    height: 320,
    backgroundColor: colors.lightGray,
    marginBottom: 10,
  },
  imageContainer: {
    width: screenWidth,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  carouselImage: {
    width: screenWidth,
    height: 320,
  },
  productInfo: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.slateBlue,
    flex: 1,
  },
  sponsorLogo: {
    width: 36,
    height: 36,
    marginLeft: 10,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.burntOrange,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 15,
    color: colors.gray,
    marginBottom: 18,
    lineHeight: 22,
  },
  optionsSection: {
    marginBottom: 18,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 8,
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    backgroundColor: colors.white,
  },
  selectedSizeButton: {
    backgroundColor: colors.burntOrange,
    borderColor: colors.burntOrange,
  },
  sizeText: {
    fontSize: 15,
    color: colors.slateBlue,
    fontWeight: '600',
  },
  selectedSizeText: {
    color: colors.boneWhite,
  },
  quantitySection: {
    marginBottom: 18,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: colors.burntOrange,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
  },
  addToCartText: {
    color: colors.boneWhite,
    fontSize: 18,
    fontWeight: '600',
  },
  relatedSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 10,
  },
  relatedList: {
    gap: 12,
  },
  relatedProductCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    width: 140,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  relatedProductImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedProductName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slateBlue,
    marginBottom: 2,
    textAlign: 'center',
  },
  relatedProductPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.burntOrange,
  },
});

export default ProductDetailScreen; 