import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name} (see backend/.env.example)`);
  }
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  port: process.env.PORT || 5000,
  isProduction,
  googleMapsApiKey: required('GOOGLE_MAPS_API_KEY'),
  firebaseProjectId: required('FIREBASE_PROJECT_ID'),
  // Only explicitly listed origins may call the API. Without FRONTEND_URL the
  // deployed frontend is rejected instead of every origin being allowed.
  allowedOrigins: [
    process.env.FRONTEND_URL,
    !isProduction && 'http://localhost:5173'
  ].filter(Boolean)
};
