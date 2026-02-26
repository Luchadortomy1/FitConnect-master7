import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { gymsApi, userSubscriptionsApi } from '@/api';
import { Gym } from '@/types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1554344058-8d1d1bc5f2f4?w=400&h=300&fit=crop';


const GymsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load all gyms without geolocation
      const allGyms = await gymsApi.getAllGyms();
      setGyms(allGyms);
      
      // Load all active subscriptions
      const subscriptions = await userSubscriptionsApi.getUserAllActiveSubscriptions();
      setUserSubscriptions(subscriptions);
    } catch (error) {
      console.error('Error loading gyms:', error);
      Alert.alert('Error', 'Failed to load gyms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadInitialData();
      return;
    }

    try {
      setLoading(true);
        const searchResults = await gymsApi.searchGyms(searchQuery);
      setGyms(searchResults);
    } catch (error) {
      console.error('Error searching gyms:', error);
      Alert.alert('Error', 'Failed to search gyms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGymPress = (gym: Gym) => {
    navigation.navigate('GymDetail' as never, { gym } as never);
  };

  const handleCall = (gym: Gym) => {
    if (gym.phone) {
      Linking.openURL(`tel:${gym.phone}`);
    }
  };

  const handleDirections = (gym: Gym) => {
    const query = encodeURIComponent(gym.address || gym.name);
    const appleMapsUrl = `http://maps.apple.com/?q=${query}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    const url = Platform.select({ ios: appleMapsUrl, android: googleMapsUrl, default: googleMapsUrl });
    if (url) {
      Linking.openURL(url);
    }
  };



  const renderGymItem = ({ item: gym }: { item: Gym }) => {
    const imageUri = gym.image || FALLBACK_IMAGE;
    const priceRange = gym.priceRange || '$$';

    return (
    <View style={[styles.gymCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity onPress={() => handleGymPress(gym)}>
        <Image 
          source={{ uri: imageUri }} 
          style={styles.gymImage}
          resizeMode="cover"
        />
        
        <View style={styles.gymInfo}>
          <View style={styles.gymHeader}>
            <Text style={[styles.gymName, { color: colors.text }]} numberOfLines={1}>
              {gym.name}
            </Text>
            <Text style={[styles.priceRange, { color: colors.primary }]}>
              {priceRange}
            </Text>
          </View>
          
          <Text style={[styles.gymAddress, { color: colors.textSecondary }]} numberOfLines={2}>
            {gym.address}
          </Text>

          {!!gym.description && (
            <Text style={[styles.gymDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {gym.description}
            </Text>
          )}
          
          <View style={styles.amenitiesContainer}>
            {gym.amenities.slice(0, 3).map((amenity, index) => (
              <View key={`${gym.id}-${amenity}-${index}`} style={[styles.amenityTag, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.amenityText, { color: colors.primary }]}>
                  {amenity}
                </Text>
              </View>
            ))}
            {gym.amenities.length > 3 && (
              <Text style={[styles.moreAmenities, { color: colors.textSecondary }]}>
                +{gym.amenities.length - 3} more
              </Text>
            )}
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleDirections(gym)}
            >
              <Ionicons name="navigate" size={16} color="white" />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>

            {!!gym.phone && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton, { borderColor: colors.primary }]}
                onPress={() => handleCall(gym)}
              >
                <Ionicons name="call" size={16} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
    );
  };

  if (loading && gyms.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding gyms near you...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Gyms & Fitness Centers
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search gyms..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              loadInitialData();
            }}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
        >
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Location Info */}

      {/* Gyms List */}
      <FlatList
        data={gyms}
        renderItem={renderGymItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No gyms found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Try adjusting your search or check your location settings
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subscriptionSection: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subscriptionGym: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  viewModeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    padding: 12,
    borderRadius: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  gymCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gymImage: {
    width: '100%',
    height: 200,
  },
  gymInfo: {
    padding: 16,
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gymName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  priceRange: {
    fontSize: 16,
    fontWeight: '600',
  },
  gymAddress: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  gymDescription: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
  },
  distance: {
    fontSize: 14,
    fontWeight: '500',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  amenityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreAmenities: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  callButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default GymsScreen;