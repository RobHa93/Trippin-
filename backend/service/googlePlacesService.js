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
        photos: place.photos?.slice(0, 6).map(photo => ({
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
 * Search places for a single type. Google Places API only supports one type per call.
 * Returns up to 20 results.
 */
async function searchByType(lat, lng, radius, type, apiKey) {
  return searchNearbyPlaces(lat, lng, radius, [type], apiKey).catch(() => []);
}

/**
 * Search multiple types in parallel (one call per type), deduplicate by ID.
 */
async function searchByTypes(lat, lng, radius, types, apiKey) {
  const results = await Promise.all(types.map(t => searchByType(lat, lng, radius, t, apiKey)));
  const seen = new Set();
  const merged = [];
  for (const batch of results) {
    for (const p of batch) {
      if (!seen.has(p.id)) { seen.add(p.id); merged.push(p); }
    }
  }
  return merged;
}

/**
 * Get city POIs (museums, parks, landmarks, restaurants, etc.)
 * Makes one API call PER type so we get up to 20 × N unique results.
 */
export async function getCityPlaces(lat, lng, count, apiKey) {
  const types = ['tourist_attraction', 'museum', 'restaurant'];
  const places = await searchByTypes(lat, lng, 5000, types, apiKey);
  places.sort((a, b) =>
    (b.rating || 0) * Math.log(b.userRatingsTotal + 1) -
    (a.rating || 0) * Math.log(a.userRatingsTotal + 1)
  );
  return enrichPlacesWithDetails(places, apiKey);
}

/**
 * Get excursion POIs (nature, mountains, lakes, nearby towns)
 * Makes one API call PER type.
 */
export async function getExcursionPlaces(lat, lng, count, apiKey) {
  const types = ['tourist_attraction', 'park', 'natural_feature'];
  let places = await searchByTypes(lat, lng, 50000, types, apiKey);

  // Keep only places at least 10 km from center (true day trips)
  places = places.filter(p => calculateDistance(lat, lng, p.lat, p.lng) > 10);

  places.sort((a, b) =>
    (b.rating || 0) * Math.log(b.userRatingsTotal + 1) -
    (a.rating || 0) * Math.log(a.userRatingsTotal + 1)
  );
  return enrichPlacesWithDetails(places, apiKey);
}

/**
 * Get place details including description
 */
export async function getPlaceDetails(placeId, apiKey) {
  try {
    const response = await axios.get(`${GOOGLE_PLACES_API}/details/json`, {
      params: {
        place_id: placeId,
        fields: 'editorial_summary,reviews,website,formatted_phone_number',
        key: apiKey,
        language: 'de'
      }
    });

    if (response.data.status === 'OK') {
      const details = response.data.result;
      
      // Get editorial summary or first review as description
      let description = details.editorial_summary?.overview || '';
      
      // If no editorial summary, use a relevant review snippet
      if (!description && details.reviews && details.reviews.length > 0) {
        const topReview = details.reviews
          .filter(r => r.rating >= 4 && r.text && r.text.length > 50)
          .sort((a, b) => b.rating - a.rating)[0];
        
        if (topReview) {
          description = topReview.text.substring(0, 200);
          if (topReview.text.length > 200) description += '...';
        }
      }

      return {
        description,
        website: details.website,
        phone: details.formatted_phone_number
      };
    }

    return { description: '', website: '', phone: '' };
  } catch (error) {
    console.error('Place details error:', error.message);
    return { description: '', website: '', phone: '' };
  }
}

/**
 * Enrich places with detailed descriptions.
 * Only calls the Details API for the first ENRICH_LIMIT places to control cost,
 * but RETURNS all places so every day gets unique stops.
 */
export async function enrichPlacesWithDetails(places, apiKey) {
  const ENRICH_LIMIT = 20;
  const toEnrich = places.slice(0, ENRICH_LIMIT);
  const rest = places.slice(ENRICH_LIMIT).map(p => ({
    ...p,
    description: '',
    website: '',
    phone: ''
  }));

  const enriched = await Promise.all(
    toEnrich.map(async (place) => {
      const details = await getPlaceDetails(place.id, apiKey);
      return {
        ...place,
        description: details.description,
        website: details.website,
        phone: details.phone
      };
    })
  );

  return [...enriched, ...rest];
}

/**
 * Get a single replacement stop, excluding already-used place IDs
 */
export async function getReplacementStop(lat, lng, dayType, excludeIds, apiKey) {
  const excludeSet = new Set(excludeIds);
  let places;

  if (dayType === 'city') {
    places = await searchByTypes(lat, lng, 5000, [
      'tourist_attraction', 'museum', 'park', 'art_gallery',
      'restaurant', 'cafe', 'bar', 'shopping_mall'
    ], apiKey);
  } else {
    const all = await searchByTypes(lat, lng, 50000, [
      'tourist_attraction', 'natural_feature', 'park', 'campground', 'amusement_park'
    ], apiKey);
    places = all.filter(p => calculateDistance(lat, lng, p.lat, p.lng) > 10);
  }

  // Only candidates not already in the trip
  const candidates = places.filter(p => !excludeSet.has(p.id));
  candidates.sort((a, b) => {
    const sA = (a.rating || 0) * Math.log(a.userRatingsTotal + 1);
    const sB = (b.rating || 0) * Math.log(b.userRatingsTotal + 1);
    return sB - sA;
  });

  if (candidates.length === 0) return null;
  const enriched = await enrichPlacesWithDetails([candidates[0]], apiKey);
  return enriched[0];
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
