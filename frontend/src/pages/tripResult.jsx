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
  const [focusedStopIndex, setFocusedStopIndex] = useState(null);

  if (!trip) {
    navigate('/');
    return null;
  }

  const selectedDay = trip.days.find(d => d.dayNumber === selectedDayNumber);
  const mapCenter = { lat: trip.meta.centerLat, lng: trip.meta.centerLng };

  // Callback für DayPlan, wenn StopCard expandiert wird
  const handleFocusStop = (index) => {
    setFocusedStopIndex(index);
  };

  return (
    <div className="min-h-screen absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-200">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                {trip.meta.location}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {trip.meta.totalDays} Tage · {trip.meta.cityDays} Stadttage · {trip.meta.excursionDays} Ausflugstage
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium 
                         hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow"
            >
              ← Neue Planung
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Side - Day Selector */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-gray-200 shadow-lg 
                              hover:shadow-xl transition-all duration-300">
                <DayList
                  days={trip.days}
                  selectedDay={selectedDayNumber}
                  onSelectDay={setSelectedDayNumber}
                />
              </div>
            </div>
          </div>

          {/* Mobile Day Selector */}
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {trip.days.map((day) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setSelectedDayNumber(day.dayNumber)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium 
                              transition-all duration-300 shadow-sm ${
                    selectedDayNumber === day.dayNumber
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-gray-900 border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Tag {day.dayNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Center - Day Plan */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-gray-200 shadow-xl p-4">
              {selectedDay ? (
                <DayPlan day={selectedDay} onFocusStop={handleFocusStop} />
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500">Wähle einen Tag aus</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-lg 
                              hover:shadow-xl transition-all duration-300">
                <div className="h-[550px] lg:h-[600px]">
                  <MapView day={selectedDay} center={mapCenter} focusedStopIndex={focusedStopIndex} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}