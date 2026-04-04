import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTripPlanner } from '../hooks/useTripPlanner';
import LoadingSpinner from '../components/loadingSpinner';

/**
 * Page to generate and load trip
 */
export default function TripPlanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateTrip, loading, error } = useTripPlanner();

  const tripRequest = location.state?.tripRequest;

  useEffect(() => {
    if (!tripRequest) {
      navigate('/');
      return;
    }

    // Generate trip on mount
    const generate = async () => {
      try {
        const trip = await generateTrip(tripRequest);
        navigate('/result', { state: { trip } });
      } catch (err) {
        // Error is already set in the hook
        console.error('Trip generation failed:', err);
      }
    };

    generate();
  }, [tripRequest, navigate]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {loading && (
            <>
              <LoadingSpinner text="Reiseplan wird erstellt..." />
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <p>🔍 Sehenswürdigkeiten werden gesucht</p>
                <p>🗺️ Routen werden optimiert</p>
                <p>✨ Tagesplan wird erstellt</p>
              </div>
            </>
          )}

          {error && (
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Fehler
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Zurück zum Start
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
