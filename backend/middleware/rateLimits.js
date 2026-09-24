import { rateLimit } from 'express-rate-limit';
import { AppError } from '../errors.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Runs after requireAuth, so limits apply per account rather than per IP.
const perUser = {
  windowMs: FIFTEEN_MINUTES,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => req.user.uid,
  handler: (req, res, next) => next(new AppError(429, 'RATE_LIMITED'))
};

export const apiLimiter = rateLimit({ ...perUser, limit: 100 });

// Saved-trips grid and expanded stop cards load many photos at once.
export const photoLimiter = rateLimit({ ...perUser, limit: 300 });

// A single trip generation fans out into dozens of Google API calls.
export const tripGenerationLimiter = rateLimit({ ...perUser, limit: 20 });
