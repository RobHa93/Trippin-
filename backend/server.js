import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tripRoutes from './routes/tripRoutes.js';
import placesRoutes from './routes/placesRoutes.js';
import directionsRoutes from './routes/directionsRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
  
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('⚠️  Warning: GOOGLE_MAPS_API_KEY not set in .env');
  }
});
