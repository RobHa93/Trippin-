import axios from 'axios';

const GOOGLE_PLACES_API = 'https://maps.googleapis.com/maps/api/place';
const GOOGLE_GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode';

/**
 * Get coordinates for a location (city or region)
 */
export async function geocodeLocation(location, apiKey) {
  try {
    const response = await axios.get(`${GOOGLE_GEOCODING_API}/json`, {
      params: {
        address: location,
        key: apiKey
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address
      };
    }

    throw new Error(`Geocoding failed: ${response.data.status}`);
  } catch (error) {
    console.error('Geocoding error:', error.message);
    console.error('Full error:', error.response?.data || error);
    throw error;
  }
}

/**
 * Search for places near a location
 */
export async function searchNearbyPlaces(lat, lng, radius, types, apiKey) {
  try {
    const response = await axios.get(`${GOOGLE_PLACES_API}/nearbysearch/json`, {
      params: {
        location: `${lat},${lng}`,
        radius: radius,
        type: types.join('|'),
        key: apiKey
      }
    });

    if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
      return response.data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        types: place.types,
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        vicinity: place.vicinity,
        businessStatus: place.business_status,
        openNow: place.opening_hours?.open_now,
        photos: place.photos?.slice(0, 3).map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        })) || [],
        priceLevel: place.price_level
      }));
    }

    throw new Error(`Places search failed: ${response.data.status}`);
  } catch (error) {
    console.error('Places search error:', error.message);
    console.error('Full error:', error.response?.data || error);
    throw error;
  }
}

/**
 * Get city POIs (museums, parks, landmarks, etc.)
 */
export async function getCityPlaces(lat, lng, count, apiKey) {
  const cityTypes = [
    'tourist_attraction',
    'museum',
    'park',
    'art_gallery',
    'church',
    'city_hall',
    'landmark'
  ];

  const radius = 5000; // 5km for city center
  let places = await searchNearbyPlaces(lat, lng, radius, cityTypes, apiKey);

  // Sort by rating and popularity
  places.sort((a, b) => {
    const scoreA = (a.rating || 0) * Math.log(a.userRatingsTotal + 1);
    const scoreB = (b.rating || 0) * Math.log(b.userRatingsTotal + 1);
    return scoreB - scoreA;
  });

  // Return top N unique places
  return places.slice(0, count * 2); // Get more than needed for variety
}

/**
 * Get excursion POIs (nature, mountains, lakes, nearby towns)
 */
export async function getExcursionPlaces(lat, lng, count, apiKey) {
  const excursionTypes = [
    'natural_feature',
    'park',
    'point_of_interest',
    'tourist_attraction',
    'locality'
  ];

  const radius = 50000; // 50km for excursions
  let places = await searchNearbyPlaces(lat, lng, radius, excursionTypes, apiKey);

  // Filter out places too close to center (want day trips, not city center)
  places = places.filter(place => {
    const distance = calculateDistance(lat, lng, place.lat, place.lng);
    return distance > 10; // At least 10km away
  });

  // Sort by rating
  places.sort((a, b) => {
    const scoreA = (a.rating || 0) * Math.log(a.userRatingsTotal + 1);
    const scoreB = (b.rating || 0) * Math.log(b.userRatingsTotal + 1);
    return scoreB - scoreA;
  });

  return places.slice(0, count * 2);
}

/**
 * Calculate distance between two coordinates in km
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
