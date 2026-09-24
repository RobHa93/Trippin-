import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from '../config.js';
import { AppError } from '../errors.js';

// Verifying ID tokens only needs the project ID (Google's public signing
// keys are fetched automatically), so no service-account credentials.
const auth = getAuth(initializeApp({ projectId: config.firebaseProjectId }));

export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('Authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'UNAUTHENTICATED'));
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid };
    next();
  } catch {
    next(new AppError(401, 'UNAUTHENTICATED'));
  }
}
