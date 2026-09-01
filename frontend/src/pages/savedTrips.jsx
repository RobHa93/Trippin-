import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteTrip, getUserTrips } from '../services/tripsService';
import UserMenu from '../components/userMenu';
import LoadingSpinner from '../components/loadingSpinner';
import { getPlanStyleLabel, getDayTypeLabel, getPhotoUrl } from '../utils/formatUtils';

const MODE_STYLE = {
  activity: { gradient: 'from-orange-300 via-pink-400 to-purple-400', emoji: '🏝️' },
  meal: { gradient: 'from-rose-300 via-amber-300 to-orange-300', emoji: '🍽️' }
};

function getCoverPhotoUrl(trip) {
  const stopWithPhoto = trip?.days
    ?.flatMap((d) => d.stops || [])
    .find((s) => s.photos?.[0]?.reference);
  return stopWithPhoto ? getPhotoUrl(stopWithPhoto.photos[0].reference, 500) : null;
}

function TripCard({ item, index, onOpen, onDelete, isDeleting }) {
  const trip = item.trip;
  const firstDay = trip?.days?.[0];
  const isMeal = firstDay?.dayType === 'meal';
  const style = isMeal ? MODE_STYLE.meal : MODE_STYLE.activity;
  const coverUrl = getCoverPhotoUrl(trip);

  const formatDate = (createdAt) => {
    if (!createdAt?.toDate) return null;
    return createdAt.toDate().toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const savedDate = formatDate(item.createdAt);

  const fields = isMeal
    ? [
        { label: 'Anlass', value: getDayTypeLabel('meal', firstDay.mealType) },
        { label: 'Vorschläge', value: `${firstDay.stops?.length || 0}` }
      ]
    : [
        { label: 'Reise', value: `${trip?.meta?.totalDays || '–'} Tage` },
        { label: 'Stil', value: getPlanStyleLabel(trip?.meta?.planStyle) }
      ];

  return (
    <div
      className="relative animate-card-in"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <button
        onClick={() => onOpen(item.id)}
        className="block w-full text-left overflow-hidden bg-white rounded-3xl shadow-xl border border-white/60 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
      >
        {/* Cover */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${style.gradient}`}>
              <span className="text-5xl drop-shadow-lg">{style.emoji}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-12 flex items-center gap-2 text-white">
            <span className="text-lg">{style.emoji}</span>
            <span className="text-lg font-semibold truncate drop-shadow">{trip?.meta?.location}</span>
          </div>
        </div>

        {/* Perforation divider */}
        <div className="relative mx-5">
          <div className="border-t-2 border-dashed border-gray-200" />
          <span className="absolute left-0 top-0 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-50" />
          <span className="absolute right-0 top-0 w-5 h-5 translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-50" />
        </div>

        {/* Ticket stub */}
        <div className="grid grid-cols-2 gap-3 p-5">
          {fields.map((f) => (
            <div key={f.label}>
              <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">{f.label}</div>
              <div className="text-sm font-semibold text-gray-800">{f.value}</div>
            </div>
          ))}
          {savedDate && (
            <div className="col-span-2 text-[10px] tracking-widest text-gray-300 uppercase">
              Gespeichert · {savedDate}
            </div>
          )}
        </div>
      </button>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
        disabled={isDeleting}
        title="Aus gespeicherten Zielen entfernen"
        className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-white transition ${isDeleting ? 'opacity-50' : ''}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

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
      .catch((err) => {
        console.error('Load trips failed', err);
        setError(
          err.code === 'failed-precondition'
            ? 'Firestore braucht noch einen Index für diese Abfrage — Link dazu steht in der Browser-Konsole (F12), einfach anklicken.'
            : `Gespeicherte Reisen konnten nicht geladen werden (${err.code || err.message}).`
        );
      });
  }, [user]);

  const handleDelete = async (tripId) => {
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

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100">
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/30 via-orange-200/30 to-pink-300/40 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute w-64 h-64 rounded-full top-20 right-20 bg-yellow-300/20 blur-3xl"></div>
      <div className="absolute rounded-full bottom-20 left-20 w-96 h-96 bg-orange-400/20 blur-3xl"></div>

      <div className="container relative px-4 py-8 mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text">
              ❤️ Gespeicherte Ziele
            </h1>
            <p className="mt-1 text-sm text-gray-500">Deine gespeicherten Reisepläne und Essenstipps</p>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              title="Zur vorherigen Seite zurück"
              className="px-4 py-2 text-sm font-medium text-gray-700 transition bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md whitespace-nowrap"
            >
              ← Zurück
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 transition bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md whitespace-nowrap"
            >
              Neue Planung
            </button>
            <UserMenu />
          </div>
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
          <div className="max-w-md p-10 mx-auto text-center border border-dashed shadow-xl bg-white/70 backdrop-blur-xl rounded-3xl border-gray-300">
            <div className="mb-3 text-4xl">✈️</div>
            <p className="font-semibold text-gray-700">Noch kein Ziel gestempelt.</p>
            <p className="mt-1 text-sm text-gray-400">Speichere eine Reise oder Essenstipps über das Icon auf der Ergebnisseite.</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 mt-5 font-semibold text-white transition rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:shadow-lg"
            >
              Reise planen 🚀
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips?.map((item, index) => (
            <TripCard
              key={item.id}
              item={item}
              index={index}
              onOpen={(id) => navigate(`/trips/${id}`)}
              onDelete={handleDelete}
              isDeleting={deletingId === item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
