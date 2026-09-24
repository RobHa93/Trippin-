import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { AppError, errorHandler } from './errors.js';
import { requireAuth } from './middleware/requireAuth.js';
import { apiLimiter, photoLimiter } from './middleware/rateLimits.js';
import tripRoutes from './routes/tripRoutes.js';
import placesRoutes from './routes/placesRoutes.js';
import directionsRoutes from './routes/directionsRoutes.js';
import { runConnectionTests } from './test/connectionTests.js';

const app = express();

// Railway/Render terminate TLS in a proxy in front of the app; needed for a correct req.ip.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: config.allowedOrigins }));
// Replace-stop/route requests carry full stop objects; trip requests are tiny.
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api', requireAuth);
app.use('/api/trip', apiLimiter, tripRoutes);
app.use('/api/directions', apiLimiter, directionsRoutes);
app.use('/api/places', photoLimiter, placesRoutes);

app.use((req, res, next) => next(new AppError(404, 'NOT_FOUND')));
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Trippin' backend running on port ${config.port}`);
  console.log(`Allowed origins: ${config.allowedOrigins.join(', ') || '(none)'}`);

  // Best-effort sanity check for external dependencies (Google Maps, Firebase) —
  // never blocks or crashes the server, just reports problems early.
  runConnectionTests().catch((err) => console.error('Connection tests failed to run:', err.message));
});
