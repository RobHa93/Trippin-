import express from 'express';
import { calculateRoute } from '../service/googleDirectionsService.js';

const router = express.Router();

/**
 * POST /api/directions/route
 * Calculate optimized route between multiple stops
 */
router.post('/route', async (req, res) => {
  try {
    const { stops } = req.body;

    if (!stops || !Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({
        error: 'At least 2 stops required',
        format: 'stops: [{lat, lng, name}, ...]'
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Google Maps API key not configured'
      });
    }

    const route = await calculateRoute(stops, apiKey);

    res.json({
      success: true,
      route
    });

  } catch (error) {
    console.error('Route calculation error:', error);
    res.status(500).json({
      error: 'Failed to calculate route',
      message: error.message
    });
  }
});

export default router;
