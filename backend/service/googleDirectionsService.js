import axios from 'axios';
import { AppError } from '../errors.js';

const GOOGLE_DIRECTIONS_API = 'https://maps.googleapis.com/maps/api/directions';

/**
 * Calculate optimized route between multiple stops
 */
export async function calculateRoute(stops, apiKey) {
  if (stops.length < 2) {
    throw new AppError(400, 'INVALID_INPUT', 'At least 2 stops required for route calculation');
  }

  const origin = `${stops[0].lat},${stops[0].lng}`;
  const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
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
  const { status } = response.data;

  if (status === 'ZERO_RESULTS') {
    throw new AppError(422, 'NO_ROUTE_FOUND');
  }
  if (status !== 'OK') {
    throw new AppError(502, 'UPSTREAM_ERROR', `Directions API failed: ${status}`);
  }

  const route = response.data.routes[0];
  let totalDistanceMeters = 0;
  let totalDurationSeconds = 0;

  const routeLegs = route.legs.map(leg => {
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
