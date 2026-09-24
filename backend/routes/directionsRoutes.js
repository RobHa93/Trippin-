import express from 'express';
import { config } from '../config.js';
import { asyncRoute } from '../errors.js';
import { routeSchema, validateBody } from '../validation.js';
import { calculateRoute } from '../service/googleDirectionsService.js';

const router = express.Router();

router.post('/route', validateBody(routeSchema), asyncRoute(async (req, res) => {
  const route = await calculateRoute(req.body.stops, config.googleMapsApiKey);
  res.json({ success: true, route });
}));

export default router;
