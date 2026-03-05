import React from 'react';
import { getDayTypeLabel } from '../utils/formatUtils';

/**
 * Component to display list of days with selection
 */
export default function DayList({ days, selectedDay, onSelectDay }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Tagesübersicht</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {days.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => onSelectDay(day.dayNumber)}
            className={`w-full px-4 py-3 text-left transition-colors ${
              selectedDay === day.dayNumber
                ? 'bg-primary-50 border-l-4 border-primary-500'
                : 'hover:bg-gray-50 border-l-4 border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  Tag {day.dayNumber}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {getDayTypeLabel(day.dayType)} · {day.stops?.length || 0} Stops
                </div>
              </div>
              {selectedDay === day.dayNumber && (
                <svg 
                  className="w-5 h-5 text-primary-500" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
