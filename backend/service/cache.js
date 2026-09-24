/**
 * Simple in-memory TTL cache for external API responses (Geocoding, Places).
 * Caches the in-flight Promise (not just the resolved value), so concurrent
 * requests for the same key share a single upstream call.
 *
 * Keys contain user input, so the size is capped: a Map keeps insertion
 * order, and re-inserting on every hit turns the first key into the least
 * recently used one, which gets evicted.
 */
const MAX_ENTRIES = 5000;
const store = new Map();

export function withCache(key, ttlMs, fetchFn) {
  const hit = store.get(key);
  store.delete(key);
  if (hit && hit.expiresAt > Date.now()) {
    store.set(key, hit);
    return hit.valuePromise;
  }

  const valuePromise = Promise.resolve().then(fetchFn);
  valuePromise.catch(() => store.delete(key)); // don't cache failures
  store.set(key, { expiresAt: Date.now() + ttlMs, valuePromise });

  if (store.size > MAX_ENTRIES) {
    store.delete(store.keys().next().value);
  }
  return valuePromise;
}

export const TTL = {
  GEOCODE: 30 * 24 * 60 * 60 * 1000,
  NEARBY_SEARCH: 3 * 24 * 60 * 60 * 1000,
  PLACE_DETAILS: 30 * 24 * 60 * 60 * 1000,
};
