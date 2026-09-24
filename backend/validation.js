import { z } from 'zod';
import { AppError } from './errors.js';

export const MAX_TRIP_DAYS = 4;
const MAX_STOPS_PER_ROUTE = 10;
// A trip has at most MAX_TRIP_DAYS × 5 stops; leaves headroom for replacements.
const MAX_EXCLUDED_IDS = 50;

const location = z.string().trim().min(1).max(100);
const coordinates = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});
const dayCount = z.number().int().min(0).max(MAX_TRIP_DAYS);

const activityTrip = z.object({
  mode: z.literal('activity'),
  location,
  totalDays: dayCount.min(1),
  cityDays: dayCount,
  excursionDays: dayCount,
  planStyle: z.enum(['relaxed', 'packed']),
  startLocation: coordinates.optional()
});

const mealTrip = z.object({
  mode: z.enum(['breakfast', 'lunch', 'dinner']),
  location,
  cuisine: z.string().trim().max(40).optional()
});

export const generateTripSchema = z
  .discriminatedUnion('mode', [activityTrip, mealTrip])
  .refine(
    (trip) => trip.mode !== 'activity' || trip.cityDays + trip.excursionDays === trip.totalDays,
    'cityDays + excursionDays must equal totalDays'
  );

export const replaceStopSchema = coordinates.extend({
  dayType: z.enum(['city', 'excursion']),
  excludeIds: z.array(z.string().max(300)).max(MAX_EXCLUDED_IDS).default([])
});

export const routeSchema = z.object({
  stops: z.array(coordinates).min(2).max(MAX_STOPS_PER_ROUTE)
});

/**
 * Replaces req.body with the parsed result, so handlers only ever see
 * known fields with the expected types (unknown keys are stripped).
 */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(400, 'INVALID_INPUT'));
  }
  req.body = result.data;
  next();
};
