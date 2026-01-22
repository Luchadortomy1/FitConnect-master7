import { Gym } from '@/types';
import { googlePlacesApi } from './googlePlaces';

// Mock gym data
const mockGyms: Gym[] = [
  {
    id: '1',
    name: 'Iron Gym',
    address: '123 Main St, Los Angeles, CA 90210',
    latitude: 34.0522,
    longitude: -118.2437,
    phone: '+1 (555) 123-4567',
    website: 'https://irongym.com',
    rating: 4.8,
    priceRange: '$$',
    amenities: ['Free Weights', 'Cardio Equipment', 'Group Classes', 'Personal Training', 'Locker Rooms', 'Parking'],
    openHours: {
      Monday: '5:00 AM - 11:00 PM',
      Tuesday: '5:00 AM - 11:00 PM',
      Wednesday: '5:00 AM - 11:00 PM',
      Thursday: '5:00 AM - 11:00 PM',
      Friday: '5:00 AM - 10:00 PM',
      Saturday: '6:00 AM - 9:00 PM',
      Sunday: '7:00 AM - 8:00 PM',
    },
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    ],
  },
  {
    id: '2',
    name: 'Fitness World',
    address: '456 Oak Ave, New York, NY 10001',
    latitude: 40.7128,
    longitude: -74.006,
    phone: '+1 (555) 987-6543',
    website: 'https://fitnessworld.com',
    rating: 4.5,
    priceRange: '$$$',
    amenities: ['Free Weights', 'Cardio Equipment', 'Pool', 'Sauna', 'Group Classes', 'Personal Training', 'Cafe'],
    openHours: {
      Monday: '24 Hours',
      Tuesday: '24 Hours',
      Wednesday: '24 Hours',
      Thursday: '24 Hours',
      Friday: '24 Hours',
      Saturday: '24 Hours',
      Sunday: '24 Hours',
    },
    images: [
      'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    ],
  },
  {
    id: '3',
    name: 'Powerhouse Gym',
    address: '789 Elm St, Chicago, IL 60601',
    latitude: 41.8781,
    longitude: -87.6298,
    phone: '+1 (555) 456-7890',
    rating: 4.6,
    priceRange: '$$',
    amenities: ['Free Weights', 'Powerlifting Area', 'Cardio Equipment', 'Group Classes', 'Personal Training'],
    openHours: {
      Monday: '5:00 AM - 10:00 PM',
      Tuesday: '5:00 AM - 10:00 PM',
      Wednesday: '5:00 AM - 10:00 PM',
      Thursday: '5:00 AM - 10:00 PM',
      Friday: '5:00 AM - 9:00 PM',
      Saturday: '6:00 AM - 8:00 PM',
      Sunday: '7:00 AM - 7:00 PM',
    },
    images: [
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop',
    ],
  },
  {
    id: '4',
    name: 'Elite Fitness',
    address: '321 Pine St, Miami, FL 33101',
    latitude: 25.7617,
    longitude: -80.1918,
    phone: '+1 (555) 321-0987',
    website: 'https://elitefitness.com',
    rating: 4.9,
    priceRange: '$$$',
    amenities: ['Free Weights', 'Cardio Equipment', 'Pool', 'Spa', 'Group Classes', 'Personal Training', 'Nutrition Counseling'],
    openHours: {
      Monday: '5:00 AM - 11:00 PM',
      Tuesday: '5:00 AM - 11:00 PM',
      Wednesday: '5:00 AM - 11:00 PM',
      Thursday: '5:00 AM - 11:00 PM',
      Friday: '5:00 AM - 10:00 PM',
      Saturday: '6:00 AM - 9:00 PM',
      Sunday: '7:00 AM - 8:00 PM',
    },
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    ],
  },
];

// Utility function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

// Gyms API service
export const gymsApi = {
  async getAllGyms(): Promise<Gym[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockGyms;
  },

  async getGym(id: string): Promise<Gym | null> {
    try {
      // Try to get real gym details from Google Places API
      const realGym = await googlePlacesApi.getGymDetails(id);
      if (realGym) {
        return realGym;
      }
    } catch (error) {
      console.error('Error fetching real gym details:', error);
    }

    // Fallback to mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockGyms.find(gym => gym.id === id) || null;
  },

  async getNearbyGyms(latitude: number, longitude: number, radiusKm: number = 50): Promise<Gym[]> {
    try {
      // Try to get real gyms from Google Places API first
      const radiusMeters = radiusKm * 1000; // Convert km to meters
      const realGyms = await googlePlacesApi.getNearbyGyms(latitude, longitude, radiusMeters);
      
      if (realGyms.length > 0) {
        // Add distance calculation to real gyms
        const gymsWithDistance = realGyms.map(gym => ({
          ...gym,
          distance: calculateDistance(latitude, longitude, gym.latitude, gym.longitude),
        }));
        return gymsWithDistance.sort((a, b) => a.distance - b.distance);
      }
    } catch (error) {
      console.error('Error fetching real gyms:', error);
    }

    // Fallback to mock data if API fails
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const gymsWithDistance = mockGyms.map(gym => ({
      ...gym,
      distance: calculateDistance(latitude, longitude, gym.latitude, gym.longitude),
    }));

    return gymsWithDistance
      .filter(gym => gym.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  },

  async searchGyms(query: string, location?: { latitude: number; longitude: number }): Promise<Gym[]> {
    try {
      // Try to search real gyms using Google Places API
      const realGyms = await googlePlacesApi.searchGyms(query, location);
      if (realGyms.length > 0) {
        return realGyms;
      }
    } catch (error) {
      console.error('Error searching real gyms:', error);
    }

    // Fallback to mock data search
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const lowercaseQuery = query.toLowerCase();
    return mockGyms.filter(gym =>
      gym.name.toLowerCase().includes(lowercaseQuery) ||
      gym.address.toLowerCase().includes(lowercaseQuery) ||
      gym.amenities.some(amenity => amenity.toLowerCase().includes(lowercaseQuery))
    );
  },

  async getGymsByPriceRange(priceRange: '$' | '$$' | '$$$'): Promise<Gym[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockGyms.filter(gym => gym.priceRange === priceRange);
  },

  async getFeaturedGyms(): Promise<Gym[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return highest rated gyms as featured
    return mockGyms
      .filter(gym => gym.rating >= 4.7)
      .slice(0, 3);
  },

  // Get user's current location using Google Places API
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return await googlePlacesApi.getCurrentLocation();
  },

  // Generate Google Maps directions URL
  getDirectionsUrl(destinationGym: Gym, userLocation?: { latitude: number; longitude: number }): string {
    return googlePlacesApi.getDirectionsUrl(destinationGym, userLocation);
  },

  // Get static map image URL
  getStaticMapUrl(gym: Gym, width?: number, height?: number, zoom?: number): string {
    return googlePlacesApi.getStaticMapUrl(gym, width, height, zoom);
  },
};