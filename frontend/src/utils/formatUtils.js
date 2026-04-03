/**
 * Format distance from meters to human-readable string
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration from seconds to human-readable string
 */
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
  return `${minutes}min`;
}

/**
 * Format duration from minutes to human-readable string
 */
export function formatDurationMin(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins}min`;
}

/**
 * Get plan style label
 */
export function getPlanStyleLabel(style) {
  return style === 'relaxed' ? 'Gemütlich' : 'Aktiv';
}

/**
 * Get day type label
 */
export function getDayTypeLabel(type) {
  return type === 'city' ? 'Stadttag' : 'Ausflugstag';
}
