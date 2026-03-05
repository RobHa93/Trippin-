/**
 * Calculate total distance of a route
 */
export function calculateTotalDistance(route) {
  if (!route || !route.legs) return 0;
  
  return route.legs.reduce((total, leg) => {
    return total + (leg.distanceMeters || 0);
  }, 0);
}

/**
 * Calculate total duration of a route
 */
export function calculateTotalDuration(route) {
  if (!route || !route.legs) return 0;
  
  return route.legs.reduce((total, leg) => {
    return total + (leg.durationSeconds || 0);
  }, 0);
}

/**
 * Check if all days have valid routes
 */
export function hasValidRoutes(days) {
  return days.every(day => day.route && day.route.polyline);
}

/**
 * Get route summary for a day
 */
export function getRouteSummary(day) {
  if (!day.route) {
    return {
      totalStops: day.stops?.length || 0,
      totalDistance: 0,
      totalDuration: 0
    };
  }

  return {
    totalStops: day.stops?.length || 0,
    totalDistance: parseFloat(day.route.totalDistanceKm) || 0,
    totalDuration: day.route.totalDurationMin || 0
  };
}
