import { geocodeLocation, getCityPlaces, getExcursionPlaces } from './googlePlacesService.js';
import { calculateRoute, getTravelTime } from './googleDirectionsService.js';

/**
 * Main trip generation logic
 */
export async function generateTrip(tripRequest, apiKey) {
  const { location, totalDays, planStyle, cityDays, excursionDays } = tripRequest;

  // Validate input
  if (cityDays + excursionDays !== totalDays) {
    throw new Error('City days + excursion days must equal total days');
  }

  const stopsPerDay = planStyle === 'relaxed' ? 5 : 8;

  // Step 1: Geocode the location
  const centerLocation = await geocodeLocation(location, apiKey);

  // Step 2: Build day plan array
  const days = [];
  let dayNumber = 1;

  // Add city days
  for (let i = 0; i < cityDays; i++) {
    days.push({
      dayNumber: dayNumber++,
      dayType: 'city',
      stopsCount: stopsPerDay
    });
  }

  // Add excursion days
  for (let i = 0; i < excursionDays; i++) {
    days.push({
      dayNumber: dayNumber++,
      dayType: 'excursion',
      stopsCount: stopsPerDay
    });
  }

  // Step 3: Generate stops for each day
  const generatedDays = [];
  const usedPlaceIds = new Set(); // Track used places to avoid duplicates

  for (const day of days) {
    let stops;

    if (day.dayType === 'city') {
      stops = await getCityPlaces(
        centerLocation.lat,
        centerLocation.lng,
        day.stopsCount,
        apiKey
      );
    } else {
      stops = await getExcursionPlaces(
        centerLocation.lat,
        centerLocation.lng,
        day.stopsCount,
        apiKey
      );
    }

    // Filter out already used places
    const availableStops = stops.filter(stop => !usedPlaceIds.has(stop.id));
    
    // Take only what we need and mark as used
    const selectedStops = availableStops.slice(0, day.stopsCount);
    selectedStops.forEach(stop => usedPlaceIds.add(stop.id));

    // Optimize stop order using greedy nearest-neighbor
    const optimizedStops = optimizeStopOrder(selectedStops);

    // Calculate route for the day
    let route = null;
    if (optimizedStops.length >= 2) {
      route = await calculateRoute(optimizedStops, apiKey);
      
      // Reorder stops based on optimized waypoint order
      if (route.waypointOrder && route.waypointOrder.length > 0) {
        const reorderedStops = [optimizedStops[0]]; // Keep first stop
        route.waypointOrder.forEach(index => {
          reorderedStops.push(optimizedStops[index + 1]); // +1 because waypoints exclude origin
        });
        reorderedStops.push(optimizedStops[optimizedStops.length - 1]); // Keep last stop
        
        generatedDays.push({
          ...day,
          stops: reorderedStops,
          route
        });
      } else {
        generatedDays.push({
          ...day,
          stops: optimizedStops,
          route
        });
      }
    } else {
      generatedDays.push({
        ...day,
        stops: optimizedStops,
        route: null
      });
    }
  }

  return {
    meta: {
      location: centerLocation.formattedAddress,
      centerLat: centerLocation.lat,
      centerLng: centerLocation.lng,
      totalDays,
      planStyle,
      cityDays,
      excursionDays
    },
    days: generatedDays
  };
}

/**
 * Optimize stop order using greedy nearest-neighbor algorithm
 */
function optimizeStopOrder(stops) {
  if (stops.length <= 2) return stops;

  const optimized = [stops[0]]; // Start with first stop
  const remaining = stops.slice(1);

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    
    // Find nearest remaining stop
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      current.lat,
      current.lng,
      remaining[0].lat,
      remaining[0].lng
    );

    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(
        current.lat,
        current.lng,
        remaining[i].lat,
        remaining[i].lng
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    optimized.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }

  return optimized;
}

/**
 * Calculate distance between two coordinates in km
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
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
