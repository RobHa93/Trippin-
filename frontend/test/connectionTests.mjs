import axios from 'axios';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Minimal .env reader — avoids adding a dotenv dependency for a one-off script. */
function loadEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv(join(__dirname, '..', '.env'));

/**
 * Firebase's public "recaptchaParams" endpoint just needs a valid Web API key
 * and has no side effects — the same check the Firebase Auth SDK does itself.
 */
async function testFirebaseAuthKey() {
  const apiKey = env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    return { name: 'Firebase Auth Key', ok: false, message: 'VITE_FIREBASE_API_KEY fehlt in frontend/.env' };
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
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return { name: 'Firestore', ok: false, message: 'VITE_FIREBASE_PROJECT_ID fehlt in frontend/.env' };
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

/**
 * The Maps JavaScript API key is typically HTTP-referrer restricted to the
 * browser origin, so it can't be validated live from a Node script — only
 * check it's configured. Real validation happens when the map renders
 * in-browser (see mapView.jsx).
 */
async function testGoogleMapsKeyPresence() {
  const apiKey = env.VITE_GOOGLE_MAPS_API_KEY;
  return {
    name: 'Google Maps Key (Frontend)',
    ok: !!apiKey,
    message: apiKey ? 'Konfiguriert (Live-Check nur im Browser möglich, siehe mapView.jsx)' : 'VITE_GOOGLE_MAPS_API_KEY fehlt in frontend/.env'
  };
}

export async function runConnectionTests() {
  const results = await Promise.all([testFirebaseAuthKey(), testFirestore(), testGoogleMapsKeyPresence()]);
  console.log('\n🔎 Verbindungstests (Frontend):');
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
