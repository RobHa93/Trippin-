import express from 'express';
import { config } from '../config.js';
import { AppError, asyncRoute } from '../errors.js';
import { tripGenerationLimiter } from '../middleware/rateLimits.js';
import { generateTripSchema, replaceStopSchema, validateBody } from '../validation.js';
import { generateTrip } from '../service/tripPlannerService.js';
import { getReplacementStop } from '../service/googlePlacesService.js';

const router = express.Router();

router.post('/generate', tripGenerationLimiter, validateBody(generateTripSchema), asyncRoute(async (req, res) => {
  const trip = await generateTrip(req.body, config.googleMapsApiKey);
  res.json({ success: true, trip });
}));

router.post('/replace-stop', validateBody(replaceStopSchema), asyncRoute(async (req, res) => {
  const { lat, lng, dayType, excludeIds } = req.body;

  const stop = await getReplacementStop(lat, lng, dayType, excludeIds, config.googleMapsApiKey);
  if (!stop) {
    throw new AppError(404, 'NO_REPLACEMENT_FOUND');
  }

  res.json({ success: true, stop });
}));

export default router;
