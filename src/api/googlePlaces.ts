import * as Location from 'expo-location';
import { Gym } from '@/types';

const GOOGLE_PLACES_API_KEY = 'AIzaSyA_k9wLZR9G_6ZX93FFuSotolCz9uzrX4o';
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  price_level?: number;
  photos?: Array<{ height: number; width: number; photo_reference: string }>;
  types: string[];
  business_status?: string;
  opening_hours?: { open_now: boolean };
}

interface GooglePlaceDetailsResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  price_level?: number;
  formatted_phone_number?: string;
  website?: string;
  photos?: Array<{ height: number; width: number; photo_reference: string }>;
  opening_hours?: {
    open_now: boolean;
    periods: Array<{ close: { day: number; time: string }; open: { day: number; time: string } }>;
    weekday_text: string[];
  };
  reviews?: Array<{ author_name: string; rating: number; text: string; time: number }>;
  types: string[];
}

interface GoogleNearbySearchResponse {
  results: GooglePlaceResult[];
  status: string;
  next_page_token?: string;
}

interface GooglePlaceDetailsResponse {
  result: GooglePlaceDetailsResult;
  status: string;
}

const getPriceRange = (priceLevel?: number): '$' | '$$' | '$$$' => {
  if (!priceLevel) return '$$';
  switch (priceLevel) {
    case 1:
      return '$';
    case 2:
      return '$$';
    case 3:
    case 4:
      return '$$$';
    default:
      return '$$';
  }
};

const getPhotoUrl = (photoReference: string, maxWidth: number = 400): string => {
  return `${GOOGLE_PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
};

const formatOpeningHours = (weekdayText?: string[]): { [key: string]: string } => {
  if (!weekdayText) return {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const openHours: { [key: string]: string } = {};
  for (let index = 0; index < weekdayText.length; index++) {
    if (index < days.length) {
      const day = days[index];
      const hours = weekdayText[index].split(': ')[1] || 'Hours not available';
      openHours[day] = hours;
    }
  }
  return openHours;
};

const getGymAmenities = (types: string[]): string[] => {
  const amenityMap: { [key: string]: string } = {
    gym: 'Gym Equipment',
    health: 'Health Services',
    spa: 'Spa Services',
    swimming_pool: 'Swimming Pool',
    establishment: 'General Facilities',
  };
  const amenities = types.filter(type => amenityMap[type]).map(type => amenityMap[type]);
  if (amenities.length === 0 || types.includes('gym')) {
    amenities.push('Free Weights', 'Cardio Equipment', 'Locker Rooms', 'Personal Training');
  }
  return [...new Set(amenities)];
};

const convertGooglePlaceToGym = (place: GooglePlaceResult, details?: GooglePlaceDetailsResult): Gym => {
  return {
    id: place.place_id,
    name: place.name,
    address: details?.formatted_address || place.vicinity,
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    phone: details?.formatted_phone_number || '',
    website: details?.website,
    rating: place.rating || 4,
    priceRange: getPriceRange(place.price_level),
    amenities: getGymAmenities(place.types),
    openHours: formatOpeningHours(details?.opening_hours?.weekday_text),
    images: place.photos?.slice(0, 3).map(photo => getPhotoUrl(photo.photo_reference)) || [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    ],
  };
};

export const googlePlacesApi = {
  async getNearbyGyms(latitude: number, longitude: number, radius: number = 5000): Promise<Gym[]> {
    try {
      const url = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=gym&key=${GOOGLE_PLACES_API_KEY}`;
      const response = await fetch(url);
      const data: GoogleNearbySearchResponse = await response.json();
      if (data.status !== 'OK') {
        console.error('Google Places API error:', data.status);
        return [];
      }
      const gyms = data.results
        .filter(place => place.business_status !== 'CLOSED_PERMANENTLY')
        .map(place => convertGooglePlaceToGym(place))
        .slice(0, 20);
      return gyms;
    } catch (error) {
      console.error('Error fetching nearby gyms:', error);
      return [];
    }
  },

  async getGymDetails(placeId: string): Promise<Gym | null> {
    try {
      const fields = 'place_id,name,formatted_address,geometry,rating,price_level,formatted_phone_number,website,photos,opening_hours,reviews,types';
      const url = `${GOOGLE_PLACES_BASE_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`;
      const response = await fetch(url);
      const data: GooglePlaceDetailsResponse = await response.json();
      if (data.status !== 'OK') {
        console.error('Google Places API error:', data.status);
        return null;
      }
      const basicPlace: GooglePlaceResult = {
        place_id: data.result.place_id,
        name: data.result.name,
        vicinity: data.result.formatted_address,
        geometry: data.result.geometry,
        rating: data.result.rating,
        price_level: data.result.price_level,
        photos: data.result.photos,
        types: data.result.types,
      };
      return convertGooglePlaceToGym(basicPlace, data.result);
    } catch (error) {
      console.error('Error fetching gym details:', error);
      return null;
    }
  },

  async searchGyms(query: string, location?: { latitude: number; longitude: number }): Promise<Gym[]> {
    try {
      let url = `${GOOGLE_PLACES_BASE_URL}/textsearch/json?query=${encodeURIComponent(query + ' gym')}&key=${GOOGLE_PLACES_API_KEY}`;
      if (location) {
        url += `&location=${location.latitude},${location.longitude}&radius=10000`;
      }
      const response = await fetch(url);
      const data: GoogleNearbySearchResponse = await response.json();
      if (data.status !== 'OK') {
        console.error('Google Places API error:', data.status);
        return [];
      }
      const gyms = data.results
        .filter(place => place.business_status !== 'CLOSED_PERMANENTLY')
        .filter(place => place.types.includes('gym') || place.types.includes('health'))
        .map(place => convertGooglePlaceToGym(place))
        .slice(0, 15);
      return gyms;
    } catch (error) {
      console.error('Error searching gyms:', error);
      return [];
    }
  },

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return null;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 300000,
      });
      console.log('Location acquired', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.warn('Geolocation error:', error);
      return null;
    }
  },

  getDirectionsUrl(destinationGym: Gym, userLocation?: { latitude: number; longitude: number }): string {
    const destination = `${destinationGym.latitude},${destinationGym.longitude}`;
    if (userLocation) {
      const origin = `${userLocation.latitude},${userLocation.longitude}`;
      return `https://www.google.com/maps/dir/${origin}/${destination}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${destination}`;
  },

  getStaticMapUrl(gym: Gym, width: number = 400, height: number = 200, zoom: number = 15): string {
    const center = `${gym.latitude},${gym.longitude}`;
    const markers = `color:red%7Clabel:G%7C${gym.latitude},${gym.longitude}`;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${width}x${height}&markers=${markers}&key=${GOOGLE_PLACES_API_KEY}`;
  },

  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number; formattedAddress?: string } | null> {
    try {
      const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        console.warn('Geocoding failed: no results');
        return null;
      }
      const first = data[0];
      return {
        latitude: parseFloat(first.lat),
        longitude: parseFloat(first.lon),
        formattedAddress: first.display_name,
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  },
};
