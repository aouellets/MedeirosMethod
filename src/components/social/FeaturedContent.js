import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

const FeaturedContent = ({ posts, onPostPress }) => {
  const renderFeaturedPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.featuredPost}
      onPress={() => onPostPress(item.id)}
    >
      <Image 
        source={item.media_urls?.[0] ? { uri: item.media_urls[0] } : require('../../../assets/logo_transparent.png')}
        style={styles.featuredImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.featuredGradient}
      >
        <View style={styles.featuredContent}>
          <View style={styles.featuredHeader}>
            <Image 
              source={item.profiles?.avatar_url ? { uri: item.profiles.avatar_url } : require('../../../assets/logo_transparent.png')}
              style={styles.featuredAvatar}
            />
            <View style={styles.featuredUserInfo}>
              <Text style={styles.featuredUserName}>
                {item.profiles?.first_name} {item.profiles?.last_name}
              </Text>
              {item.is_sponsored && (
                <View style={styles.sponsoredBadge}>
                  <Text style={styles.sponsoredText}>Sponsored</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.featuredCaption} numberOfLines={2}>
            {item.content}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (!posts || posts.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Featured</Text>
      <FlatList
        data={posts}
        renderItem={renderFeaturedPost}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.slateBlue,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  featuredPost: {
    width: width * 0.8,
    height: 200,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 15,
    justifyContent: 'flex-end',
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  featuredUserInfo: {
    flex: 1,
  },
  featuredUserName: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  featuredCaption: {
    color: colors.white,
    fontSize: 14,
  },
  sponsoredBadge: {
    backgroundColor: colors.burntOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  sponsoredText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
});

export default FeaturedContent; 