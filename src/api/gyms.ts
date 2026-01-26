import { Gym } from '@/types';
import { googlePlacesApi } from './googlePlaces';
import { supabase } from './auth';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1554344058-8d1d1bc5f2f4?w=400&h=300&fit=crop';
const GYM_SELECT = [
  'id',
  'name',
  'description',
  'address',
  'phone',
  'is_active',
  'created_at',
  'location',
].join(',');

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

const toGym = (row: any, userLocation?: { latitude: number; longitude: number }): Gym => {
  const { id, name, address, phone, description } = row;

  const coords = (() => {
    const location = row.location;
    if (!location) return null;
    if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
      const [lon, lat] = location.coordinates;
      return { latitude: lat, longitude: lon };
    }
    if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      return { latitude: location.latitude, longitude: location.longitude };
    }
    return null;
  })();

  const distance = coords && userLocation
    ? calculateDistance(userLocation.latitude, userLocation.longitude, coords.latitude, coords.longitude)
    : undefined;

  return {
    id,
    name,
    description,
    address: address || 'Dirección no disponible',
    latitude: coords?.latitude ?? 0,
    longitude: coords?.longitude ?? 0,
    phone: phone || '',
    website: undefined,
    priceRange: '$$',
    amenities: [],
    openHours: {},
    images: [PLACEHOLDER_IMAGE],
    distance,
  };
};

// Gyms API service
export const gymsApi = {
  async getAllGyms(): Promise<Gym[]> {
    const { data, error } = await supabase
      .from('gyms')
      .select(GYM_SELECT)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gyms:', error);
      throw error;
    }

    return (data || []).map(row => toGym(row));
  },

  async getGym(id: string): Promise<Gym | null> {
    const { data, error } = await supabase
      .from('gyms')
      .select(GYM_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching gym:', error);
      return null;
    }

    return data ? toGym(data) : null;
  },

  async getNearbyGyms(latitude: number, longitude: number, radiusKm: number = 50): Promise<Gym[]> {
    const { data, error } = await supabase
      .from('gyms')
      .select(GYM_SELECT);

    if (error) {
      console.error('Error fetching nearby gyms:', error);
      throw error;
    }

    const gyms = (data || [])
      .map(row => toGym(row, { latitude, longitude }))
      .filter(gym => gym.latitude && gym.longitude);

    const withinRadius = gyms.filter(gym => (gym.distance ?? Infinity) <= radiusKm);
    return withinRadius.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  },

  async searchGyms(query: string, location?: { latitude: number; longitude: number }): Promise<Gym[]> {
    const q = query.trim();
    const { data, error } = await supabase
      .from('gyms')
      .select(GYM_SELECT)
      .or(`name.ilike.%${q}%,address.ilike.%${q}%`);

    if (error) {
      console.error('Error searching gyms:', error);
      throw error;
    }

    return (data || []).map(row => toGym(row, location));
  },

  async getGymsByPriceRange(priceRange: '$' | '$$' | '$$$'): Promise<Gym[]> {
    const { data, error } = await supabase
      .from('gyms')
      .select(GYM_SELECT);

    if (error) {
      console.error('Error fetching gyms by price range:', error);
      throw error;
    }

    return (data || [])
      .map(row => toGym(row))
      .filter(gym => gym.priceRange === priceRange);
  },

  async getFeaturedGyms(): Promise<Gym[]> {
    const { data, error } = await supabase
      .from('gyms')
      .select(GYM_SELECT)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching featured gyms:', error);
      throw error;
    }

    return (data || []).map(row => toGym(row));
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