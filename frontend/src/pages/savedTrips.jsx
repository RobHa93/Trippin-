import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteTrip, getUserTrips } from '../services/tripsService';
import UserMenu from '../components/userMenu';
import LoadingSpinner from '../components/loadingSpinner';
import { getPlanStyleLabel } from '../utils/formatUtils';

export default function SavedTrips() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    getUserTrips(user.uid)
      .then(setTrips)
      .catch(() => setError('Gespeicherte Reisen konnten nicht geladen werden'));
  }, [user]);

  const handleDelete = async (e, tripId) => {
    e.stopPropagation();
    setDeletingId(tripId);
    try {
      await deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err) {
      console.error('Delete trip failed', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (createdAt) => {
    if (!createdAt?.toDate) return '';
    return createdAt.toDate().toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100">
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/30 via-orange-200/30 to-pink-300/40 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute w-64 h-64 rounded-full top-20 right-20 bg-yellow-300/20 blur-3xl"></div>
      <div className="absolute rounded-full bottom-20 left-20 w-96 h-96 bg-orange-400/20 blur-3xl"></div>

      <UserMenu />

      <div className="container relative px-4 py-8 mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text">
              ❤️ Gespeicherte Ziele
            </h1>
            <p className="mt-1 text-sm text-gray-500">Deine gespeicherten Reisepläne</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md"
          >
            ← Neue Planung
          </button>
        </div>

        {trips === null && !error && (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Reisen werden geladen..." />
          </div>
        )}

        {error && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-2xl">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {trips?.length === 0 && (
          <div className="p-10 text-center border shadow-xl backdrop-blur-xl bg-white/80 rounded-3xl border-white/50">
            <div className="mb-3 text-4xl">🤍</div>
            <p className="text-gray-600">Noch keine Reise gespeichert.</p>
            <p className="mt-1 text-sm text-gray-400">Speichere eine Reise über das Herz-Icon auf der Ergebnisseite.</p>
          </div>
        )}

        <div className="space-y-3">
          {trips?.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/trips/${item.id}`)}
              className="flex items-center justify-between w-full p-5 text-left transition border shadow-xl backdrop-blur-xl bg-white/80 rounded-3xl border-white/50 hover:shadow-2xl hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏝️</span>
                  <span className="text-lg font-semibold text-gray-900">{item.trip?.meta?.location}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {item.trip?.meta?.totalDays} Tage · {getPlanStyleLabel(item.trip?.meta?.planStyle)}
                  {formatDate(item.createdAt) && ` · gespeichert am ${formatDate(item.createdAt)}`}
                </p>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => handleDelete(e, item.id)}
                title="Aus gespeicherten Zielen entfernen"
                className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-lg hover:bg-pink-50 transition ${deletingId === item.id ? 'opacity-50' : ''}`}
              >
                ❤️
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
