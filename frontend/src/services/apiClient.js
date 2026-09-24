import axios from 'axios';
import { auth } from '../firebase';

// Dedicated instance so the ID token is only ever attached to our own backend,
// never to third-party requests made with axios.
// In production the Vite dev proxy doesn't exist, so VITE_API_URL points at the backend.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ''
});

api.interceptors.request.use(async (request) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

const ERROR_MESSAGES = {
  INVALID_INPUT: 'Die Eingaben sind ungültig. Bitte prüfe das Formular.',
  UNAUTHENTICATED: 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.',
  RATE_LIMITED: 'Zu viele Anfragen in kurzer Zeit. Bitte warte ein paar Minuten.',
  LOCATION_NOT_FOUND: 'Diesen Ort konnten wir nicht finden.',
  NO_ROUTE_FOUND: 'Zwischen diesen Orten gibt es keine Autoroute.',
  NO_REPLACEMENT_FOUND: 'Für diesen Stop gibt es gerade keine Alternative.',
  UPSTREAM_ERROR: 'Google Maps ist gerade nicht erreichbar. Bitte versuche es später nochmal.'
};

/** Maps the backend's error code to a German message for the UI. */
export function getApiErrorMessage(err) {
  if (!err.response) return 'Keine Verbindung zum Server.';
  return ERROR_MESSAGES[err.response.data?.error]
    || 'Etwas ist schiefgelaufen. Bitte versuche es nochmal.';
}
