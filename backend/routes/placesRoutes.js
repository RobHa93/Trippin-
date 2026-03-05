import express from 'express';
import { searchNearbyPlaces, geocodeLocation } from '../service/googlePlacesService.js';

const router = express.Router();

/**
 * GET /api/places/search
 * Search for places near a location
 */
router.get('/search', async (req, res) => {
  try {
    const { location, radius = 5000, types = 'tourist_attraction' } = req.query;

    if (!location) {
      return res.status(400).json({
        error: 'Location parameter is required'
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Google Maps API key not configured'
      });
    }

    // Geocode location first
    const coords = await geocodeLocation(location, apiKey);

    // Search nearby places
    const typeArray = types.split(',').map(t => t.trim());
    const places = await searchNearbyPlaces(
      coords.lat,
      coords.lng,
      parseInt(radius),
      typeArray,
      apiKey
    );

    res.json({
      success: true,
      location: coords,
      places
    });

  } catch (error) {
    console.error('Places search error:', error);
    res.status(500).json({
      error: 'Failed to search places',
      message: error.message
    });
  }
});

export default router;
