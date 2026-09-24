import { useState } from 'react';
import { api, getApiErrorMessage } from '../services/apiClient';

/**
 * Custom hook for trip planning
 */
export function useTripPlanner() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateTrip = async (tripRequest) => {
    setLoading(true);
    setError(null);
    setTrip(null);

    try {
      const response = await api.post('/api/trip/generate', tripRequest);
      setTrip(response.data.trip);
      return response.data.trip;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetTrip = () => {
    setTrip(null);
    setError(null);
  };

  return {
    trip,
    loading,
    error,
    generateTrip,
    resetTrip
  };
}
