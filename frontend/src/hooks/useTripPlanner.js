import { useState } from 'react';
import axios from 'axios';

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
      const response = await axios.post('/api/trip/generate', tripRequest);
      
      if (response.data.success) {
        setTrip(response.data.trip);
        return response.data.trip;
      } else {
        throw new Error('Trip generation failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate trip';
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
