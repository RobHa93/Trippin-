import express from 'express';
import { config } from '../config.js';
import { asyncRoute } from '../errors.js';
import { fetchPlacePhoto } from '../service/googlePlacesService.js';

const router = express.Router();

router.get('/photo/:ref', asyncRoute(async (req, res) => {
  const { stream, contentType } = await fetchPlacePhoto(req.params.ref, req.query.w, config.googleMapsApiKey);

  res.set({
    'Content-Type': contentType || 'image/jpeg',
    'Cache-Control': 'private, max-age=86400'
  });
  stream.on('error', () => res.destroy());
  stream.pipe(res);
}));

export default router;
