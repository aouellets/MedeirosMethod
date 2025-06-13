import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { sponsors, getProductsBySponsor } from '../../data/products';

const SponsorProductsScreen = ({ navigation, route }) => {
  const { sponsor } = route.params;
  const sponsorData = sponsor === 'all' ? null : sponsors[sponsor];
  const products = sponsor === 'all' 
    ? Object.values(sponsors).flatMap(s => getProductsBySponsor(s.name))
    : getProductsBySponsor(sponsor);

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

  return (
    <View style={styles.container}>
      {sponsorData && (
        <View style={styles.sponsorHeader}>
          <Image source={sponsorData.logo} style={styles.sponsorLogo} resizeMode="contain" />
          <View style={styles.sponsorHeaderText}>
            <Text style={styles.sponsorName}>{sponsorData.name}</Text>
            <Text style={styles.sponsorDescription}>{sponsorData.description}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.boneWhite,
  },
  sponsorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  sponsorLogo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  sponsorHeaderText: {
    flex: 1,
  },
  sponsorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 4,
  },
  sponsorDescription: {
    fontSize: 14,
    color: colors.gray,
  },
  productsList: {
    padding: 10,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    height: 150,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
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

export default SponsorProductsScreen; 