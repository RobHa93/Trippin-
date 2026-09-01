import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

/**
 * Confirms the Google Maps key works by running a real geocoding lookup
 * (the same API the trip planner depends on).
 */
async function testGoogleMaps() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return { name: 'Google Maps API Key', ok: false, message: 'GOOGLE_MAPS_API_KEY fehlt in backend/.env' };
  }
  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address: 'Zürich', key: apiKey }
    });
    const ok = res.data.status === 'OK';
    return { name: 'Google Maps API Key', ok, message: ok ? 'Geocoding-Testabfrage erfolgreich' : `Google-Status: ${res.data.status}` };
  } catch (err) {
    return { name: 'Google Maps API Key', ok: false, message: err.message };
  }
}

/**
 * Firebase's public "recaptchaParams" endpoint just needs a valid Web API key
 * and has no side effects — the same check the Firebase Auth SDK does itself.
 */
async function testFirebaseAuthKey() {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    return { name: 'Firebase Auth Key', ok: false, message: 'VITE_FIREBASE_API_KEY fehlt in backend/.env' };
  }
  try {
    const res = await axios.get('https://identitytoolkit.googleapis.com/v1/recaptchaParams', {
      params: { key: apiKey },
      validateStatus: () => true
    });
    const ok = res.status === 200;
    return { name: 'Firebase Auth Key', ok, message: ok ? 'API-Key gültig' : (res.data?.error?.message || `HTTP ${res.status}`) };
  } catch (err) {
    return { name: 'Firebase Auth Key', ok: false, message: err.message };
  }
}

/**
 * Reads a doc from the "trips" collection via the Firestore REST API.
 * 200 (found) and 403 (blocked by security rules) both prove the project's
 * Firestore database is reachable and configured — only network/DNS errors
 * or a 400 (unknown project) count as a real failure.
 */
async function testFirestore() {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return { name: 'Firestore', ok: false, message: 'VITE_FIREBASE_PROJECT_ID fehlt in backend/.env' };
  }
  try {
    const res = await axios.get(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/trips`,
      { params: { pageSize: 1 }, validateStatus: () => true }
    );
    const ok = res.status === 200 || res.status === 403;
    return { name: 'Firestore', ok, message: ok ? `Erreichbar (HTTP ${res.status})` : `HTTP ${res.status}: ${res.data?.error?.message || ''}` };
  } catch (err) {
    return { name: 'Firestore', ok: false, message: err.message };
  }
}

export async function runConnectionTests() {
  const results = await Promise.all([testGoogleMaps(), testFirebaseAuthKey(), testFirestore()]);
  console.log('\n🔎 Verbindungstests (Backend):');
  for (const r of results) {
    console.log(`  ${r.ok ? '✅' : '❌'} ${r.name}: ${r.message}`);
  }
  console.log('');
  return results;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  runConnectionTests().then((results) => {
    process.exit(results.every((r) => r.ok) ? 0 : 1);
  });
}
