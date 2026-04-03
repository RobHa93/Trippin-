import express from 'express';
import { generateTrip } from '../service/tripPlannerService.js';
import { getReplacementStop } from '../service/googlePlacesService.js';

const router = express.Router();

/**
 * POST /api/trip/generate
 * Generate a complete trip itinerary
 */
router.post('/generate', async (req, res) => {
  try {
    const { location, totalDays, planStyle, cityDays, excursionDays } = req.body;

    // Validate required fields
    if (!location || !totalDays || !planStyle || cityDays === undefined || excursionDays === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['location', 'totalDays', 'planStyle', 'cityDays', 'excursionDays']
      });
    }

    // Validate plan style
    if (planStyle !== 'relaxed' && planStyle !== 'packed') {
      return res.status(400).json({
        error: 'Invalid plan style. Must be "relaxed" or "packed"'
      });
    }

    // Validate days
    if (cityDays + excursionDays !== totalDays) {
      return res.status(400).json({
        error: 'City days + excursion days must equal total days'
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Google Maps API key not configured'
      });
    }

    const trip = await generateTrip(req.body, apiKey);

    res.json({
      success: true,
      trip
    });

  } catch (error) {
    console.error('Trip generation error:', error);
    res.status(500).json({
      error: 'Failed to generate trip',
      message: error.message
    });
  }
});

/**
 * POST /api/trip/replace-stop
 * Fetch a single replacement stop for a given location and day type
 */
router.post('/replace-stop', async (req, res) => {
  try {
    const { lat, lng, dayType, excludeIds = [] } = req.body;
    if (!lat || !lng || !dayType) {
      return res.status(400).json({ error: 'Missing lat, lng or dayType' });
    }
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    const stop = await getReplacementStop(lat, lng, dayType, excludeIds, apiKey);
    if (!stop) return res.status(404).json({ error: 'No replacement stop found' });

    res.json({ success: true, stop });
  } catch (error) {
    console.error('Replace-stop error:', error);
    res.status(500).json({ error: 'Failed to find replacement stop', message: error.message });
  }
});

export default router;
