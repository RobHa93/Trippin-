import React, { useState } from 'react';
import StopCard from './stopCard';
import { getDayTypeLabel, formatDurationMin } from '../utils/formatUtils';
import { getRouteSummary } from '../utils/routeUtils';

/**
 * Component to display a single day's plan
 */
export default function DayPlan({ day, onFocusStop }) {
  const summary = getRouteSummary(day);
  const [focusedStop, setFocusedStop] = useState(null);

  // Callback für StopCard, wenn ausgeklappt
  const handleExpand = (index) => {
    setFocusedStop(index);
    if (onFocusStop) onFocusStop(index);
  };

  return (
    <div className="rounded-lg p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Tag {day.dayNumber}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            day.dayType === 'city' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {getDayTypeLabel(day.dayType)}
          </span>
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
            <StopCard key={stop.id || index} stop={stop} index={index} onExpand={() => handleExpand(index)} />
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
