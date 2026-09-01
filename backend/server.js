import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tripRoutes from './routes/tripRoutes.js';
import placesRoutes from './routes/placesRoutes.js';
import directionsRoutes from './routes/directionsRoutes.js';
import { runConnectionTests } from './test/connectionTests.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware – allow the frontend origin (set FRONTEND_URL in Render env vars)
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : true; // allow all origins if not configured
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// API Routes
app.use('/api/trip', tripRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/directions', directionsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Trippin' Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);

  // Best-effort sanity check for external dependencies (Google Maps, Firebase) —
  // never blocks or crashes the server, just reports problems early.
  runConnectionTests().catch((err) => console.error('Connection tests failed to run:', err.message));
});
