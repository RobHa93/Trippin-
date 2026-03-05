import axios from 'axios';

const GOOGLE_DIRECTIONS_API = 'https://maps.googleapis.com/maps/api/directions';

/**
 * Calculate optimized route between multiple stops
 */
export async function calculateRoute(stops, apiKey) {
  if (stops.length < 2) {
    throw new Error('At least 2 stops required for route calculation');
  }

  try {
    const origin = `${stops[0].lat},${stops[0].lng}`;
    const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
    
    // Waypoints are all stops between start and end
    const waypoints = stops.slice(1, -1).map(stop => `${stop.lat},${stop.lng}`).join('|');

    const params = {
      origin,
      destination,
      mode: 'driving',
      key: apiKey
    };

    if (waypoints) {
      params.waypoints = `optimize:true|${waypoints}`;
    }

    const response = await axios.get(`${GOOGLE_DIRECTIONS_API}/json`, { params });

    if (response.data.status === 'OK') {
      const route = response.data.routes[0];
      const legs = route.legs;

      // Calculate totals
      let totalDistanceMeters = 0;
      let totalDurationSeconds = 0;

      const routeLegs = legs.map(leg => {
        totalDistanceMeters += leg.distance.value;
        totalDurationSeconds += leg.duration.value;

        return {
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          distanceMeters: leg.distance.value,
          distanceText: leg.distance.text,
          durationSeconds: leg.duration.value,
          durationText: leg.duration.text
        };
      });

      return {
        legs: routeLegs,
        totalDistanceKm: (totalDistanceMeters / 1000).toFixed(1),
        totalDurationMin: Math.round(totalDurationSeconds / 60),
        polyline: route.overview_polyline.points,
        waypointOrder: route.waypoint_order || []
      };
    }

    throw new Error(`Directions API failed: ${response.data.status}`);
  } catch (error) {
    console.error('Route calculation error:', error.message);
    console.error('Full error:', error.response?.data || error);
    throw error;
  }
}

/**
 * Get travel time between two points
 */
export async function getTravelTime(fromLat, fromLng, toLat, toLng, apiKey) {
  try {
    const response = await axios.get(`${GOOGLE_DIRECTIONS_API}/json`, {
      params: {
        origin: `${fromLat},${fromLng}`,
        destination: `${toLat},${toLng}`,
        mode: 'driving',
        key: apiKey
      }
    });

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const leg = response.data.routes[0].legs[0];
      return {
        durationSeconds: leg.duration.value,
        durationMin: Math.round(leg.duration.value / 60),
        distanceKm: (leg.distance.value / 1000).toFixed(1)
      };
    }

    return null;
  } catch (error) {
    console.error('Travel time error:', error.message);
    return null;
  }
}
