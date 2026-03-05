import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DayList from '../components/dayList';
import DayPlan from '../components/dayPlan';
import MapView from '../components/mapView';

/**
 * Page to display trip results with day-by-day view
 */
export default function TripResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const trip = location.state?.trip;

  const [selectedDayNumber, setSelectedDayNumber] = useState(1);

  if (!trip) {
    navigate('/');
    return null;
  }

  const selectedDay = trip.days.find(d => d.dayNumber === selectedDayNumber);
  const mapCenter = { lat: trip.meta.centerLat, lng: trip.meta.centerLng };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {trip.meta.location}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {trip.meta.totalDays} Tage · {trip.meta.cityDays} Stadttage · {trip.meta.excursionDays} Ausflugstage
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              ← Neue Planung
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Side - Day Selector (hidden on mobile, shown as sidebar on desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <DayList
                days={trip.days}
                selectedDay={selectedDayNumber}
                onSelectDay={setSelectedDayNumber}
              />
            </div>
          </div>

          {/* Mobile Day Selector */}
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {trip.days.map((day) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setSelectedDayNumber(day.dayNumber)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedDayNumber === day.dayNumber
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Tag {day.dayNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Center - Day Plan */}
          <div className="lg:col-span-5">
            {selectedDay ? (
              <DayPlan day={selectedDay} />
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-500">Wähle einen Tag aus</p>
              </div>
            )}
          </div>

          {/* Right Side - Map */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-[600px]">
                  <MapView day={selectedDay} center={mapCenter} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
