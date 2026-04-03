import React, { useState } from 'react';
import StopCard from './stopCard';
import { getDayTypeLabel, formatDurationMin } from '../utils/formatUtils';
import { getRouteSummary } from '../utils/routeUtils';

/**
 * Component to display a single day's plan
 */
export default function DayPlan({ day, onFocusStop, onReplaceStop, replacingStopIndex }) {
  const summary = getRouteSummary(day);
  const [focusedStop, setFocusedStop] = useState(null);

  const handleExpand = (index) => {
    setFocusedStop(index);
    if (onFocusStop) onFocusStop(index);
  };

  const handleCollapse = () => {
    setFocusedStop(null);
    if (onFocusStop) onFocusStop(null);
  };

  // Build Google Maps directions URL using lat/lng (place_id URLs are unreliable)
  const buildGoogleMapsUrl = () => {
    if (!day.stops || day.stops.length < 2) return null;
    const stops = day.stops;
    const origin = `${stops[0].lat},${stops[0].lng}`;
    const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
    const waypoints = stops.slice(1, -1).map(s => `${s.lat},${s.lng}`).join('|');
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
    return url;
  };

  const mapsUrl = buildGoogleMapsUrl();

  return (
    <div className="rounded-lg p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Tag {day.dayNumber}
          </h2>
          <div className="flex items-center gap-2">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                title="Route in Google Maps öffnen (auch auf dem Handy nutzbar)"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Route in Maps exportieren
              </a>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              day.dayType === 'city'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {getDayTypeLabel(day.dayType)}
            </span>
          </div>
        </div>
        {day.route && (
          <div className="mt-3 flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-medium">{summary.totalStops}</span>
              <span>Stops</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{summary.totalDistance}</span>
              <span>km</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{formatDurationMin(summary.totalDuration)}</span>
              <span>Fahrzeit</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {day.stops && day.stops.length > 0 ? (
          day.stops.map((stop, index) => (
            <StopCard
              key={stop.id || index}
              stop={stop}
              index={index}
              onExpand={() => handleExpand(index)}
              onCollapse={handleCollapse}
              onReplace={onReplaceStop ? () => onReplaceStop(index) : null}
              isReplacing={replacingStopIndex === index}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            Keine Stops für diesen Tag
          </p>
        )}
      </div>
    </div>
  );
}
