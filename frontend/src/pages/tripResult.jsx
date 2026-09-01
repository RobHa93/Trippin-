import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DayList from '../components/dayList';
import DayPlan from '../components/dayPlan';
import MapView from '../components/mapView';
import WeatherWidget from '../components/weatherWidget';
import UserMenu from '../components/userMenu';
import LoadingSpinner from '../components/loadingSpinner';
import HeartBurst from '../components/heartBurst';
import { useAuth } from '../context/AuthContext';
import { saveTrip, deleteTrip, getTrip } from '../services/tripsService';
import { getDayTypeLabel } from '../utils/formatUtils';

/**
 * Page to display trip results with day-by-day view
 */
export default function TripResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId: routeTripId } = useParams();
  const { user } = useAuth();
  const initialTrip = location.state?.trip;

  const [trip, setTrip] = useState(initialTrip);
  const [savedTripId, setSavedTripId] = useState(routeTripId || null);
  const [loadingTrip, setLoadingTrip] = useState(!initialTrip && !!routeTripId);
  const [saving, setSaving] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [focusedStopIndex, setFocusedStopIndex] = useState(null);
  const [replacingStop, setReplacingStop] = useState(null); // { dayNumber, stopIndex }
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!initialTrip && routeTripId) {
      setLoadingTrip(true);
      getTrip(routeTripId)
        .then((data) => {
          if (data) {
            setTrip(data.trip);
            setSavedTripId(data.id);
          } else {
            navigate('/saved', { replace: true });
          }
        })
        .finally(() => setLoadingTrip(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeTripId]);

  const handleToggleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    setSaveError('');
    try {
      if (savedTripId) {
        await deleteTrip(savedTripId);
        setSavedTripId(null);
        navigate('/result', { replace: true, state: { trip } });
      } else {
        const id = await saveTrip(user.uid, trip);
        setSavedTripId(id);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 750);
        navigate(`/trips/${id}`, { replace: true, state: { trip } });
      }
    } catch (err) {
      console.error('Save trip failed', err);
      setSaveError(
        err.code === 'permission-denied'
          ? 'Speichern blockiert: Firestore-Regeln erlauben aktuell keinen Schreibzugriff.'
          : `Reise konnte nicht gespeichert werden (${err.code || err.message}).`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingTrip) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200">
        <LoadingSpinner text="Reiseplan wird geladen..." />
      </div>
    );
  }

  if (!trip) {
    navigate('/');
    return null;
  }

  const selectedDay = trip.days.find(d => d.dayNumber === selectedDayNumber);
  const mapCenter = { lat: trip.meta.centerLat, lng: trip.meta.centerLng };
  const isMealTrip = trip.days?.[0]?.dayType === 'meal';

  const handleFocusStop = (index) => setFocusedStopIndex(index);

  // Collect all currently used place IDs across the whole trip
  const getAllUsedIds = () => trip.days.flatMap(d => (d.stops || []).map(s => s.id));

  const handleReplaceStop = async (dayNumber, stopIndex) => {
    const day = trip.days.find(d => d.dayNumber === dayNumber);
    if (!day) return;
    setReplacingStop({ dayNumber, stopIndex });
    try {
      const excludeIds = getAllUsedIds();
      const res = await axios.post('/api/trip/replace-stop', {
        lat: trip.meta.centerLat,
        lng: trip.meta.centerLng,
        dayType: day.dayType,
        excludeIds
      });
      if (res.data.success && res.data.stop) {
        const newStops = [...day.stops];
        newStops[stopIndex] = res.data.stop;

        let route = null;
        let finalStops = newStops;
        if (newStops.length >= 2) {
          try {
            const routeRes = await axios.post('/api/directions/route', { stops: newStops });
            if (routeRes.data.success) {
              route = routeRes.data.route;
              if (route.waypointOrder && route.waypointOrder.length > 0) {
                const reordered = [newStops[0]];
                route.waypointOrder.forEach(i => reordered.push(newStops[i + 1]));
                reordered.push(newStops[newStops.length - 1]);
                finalStops = reordered;
              }
            }
          } catch (routeErr) {
            console.error('Route recalculation failed', routeErr);
          }
        }

        setTrip(prev => ({
          ...prev,
          days: prev.days.map(d => {
            if (d.dayNumber !== dayNumber) return d;
            return { ...d, stops: finalStops, route };
          })
        }));
      }
    } catch (err) {
      console.error('Replace stop failed', err);
    } finally {
      setReplacingStop(null);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 truncate">
                {trip.meta.location}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isMealTrip
                  ? `${getDayTypeLabel('meal', trip.days[0].mealType)} · ${trip.days[0].stops?.length || 0} Vorschläge`
                  : `${trip.meta.totalDays} Tage · ${trip.meta.cityDays} Stadttage · ${trip.meta.excursionDays} Ausflugstage`}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <div className="relative">
                <button
                  onClick={handleToggleSave}
                  disabled={saving}
                  title={savedTripId ? 'Reise nicht mehr speichern' : 'Ganze Reise speichern'}
                  className={`w-10 h-10 rounded-lg border text-lg flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow disabled:opacity-50 ${
                    savedTripId
                      ? 'bg-pink-50 border-pink-200 text-pink-600'
                      : 'bg-white border-gray-200 text-gray-400 hover:text-pink-500'
                  }`}
                >
                  {savedTripId ? '❤️' : '🤍'}
                </button>
                <HeartBurst active={justSaved} />
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-3 sm:px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium
                           hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow whitespace-nowrap"
              >
                ← <span className="hidden sm:inline">Neue Planung</span><span className="sm:hidden">Neu</span>
              </button>
              <UserMenu />
            </div>
          </div>
          {saveError && (
            <p className="mt-2 text-sm font-medium text-red-600">{saveError}</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 w-full max-w-full overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Side - Day Selector */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 flex flex-col gap-4">
              <div className="rounded-2xl border border-gray-200 shadow-lg 
                              hover:shadow-xl transition-all duration-300">
                <DayList
                  days={trip.days}
                  selectedDay={selectedDayNumber}
                  onSelectDay={setSelectedDayNumber}
                />
              </div>
              <WeatherWidget
                lat={trip.meta.centerLat}
                lng={trip.meta.centerLng}
              />
            </div>
          </div>

          {/* Mobile Day Selector */}
          <div className="lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex gap-2 overflow-x-auto pb-1 flex-1 min-w-0">
                {trip.days.map((day) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDayNumber(day.dayNumber)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium 
                                transition-all duration-300 shadow-sm ${
                      selectedDayNumber === day.dayNumber
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Tag {day.dayNumber}
                  </button>
                ))}
              </div>
              <WeatherWidget
                lat={trip.meta.centerLat}
                lng={trip.meta.centerLng}
                compact
              />
            </div>
          </div>

          {/* Center - Day Plan */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-gray-200 shadow-xl p-4">
              {selectedDay ? (
                <DayPlan
                  day={selectedDay}
                  onFocusStop={handleFocusStop}
                  onReplaceStop={selectedDay.dayType === 'meal' ? null : (stopIndex) => handleReplaceStop(selectedDayNumber, stopIndex)}
                  replacingStopIndex={replacingStop?.dayNumber === selectedDayNumber ? replacingStop.stopIndex : null}
                />
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
                <div className="h-[320px] sm:h-[420px] lg:h-[600px]">
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