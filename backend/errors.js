/**
 * Error with a stable, client-safe `code`. `detail` is only ever logged,
 * never sent to the client.
 */
export class AppError extends Error {
  constructor(status, code, detail) {
    super(detail || code);
    this.status = status;
    this.code = code;
  }
}

// Express 4 doesn't forward rejected promises from async handlers to the
// error middleware on its own.
export const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

/**
 * Logs only fields that are safe to keep. A raw axios error carries the full
 * request config, including the Google API key in `config.params.key`.
 */
export function logError(context, error) {
  console.error(`${context}:`, {
    message: error.message,
    code: error.code,
    httpStatus: error.response?.status,
    apiStatus: error.response?.data?.status,
    apiMessage: error.response?.data?.error_message
  });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    if (err.status >= 500) logError(`${req.method} ${req.path}`, err);
    return res.status(err.status).json({ error: err.code });
  }

  // Malformed JSON body etc. from express.json()
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(400).json({ error: 'INVALID_INPUT' });
  }

  logError(`${req.method} ${req.path}`, err);
  if (err.isAxiosError) {
    return res.status(502).json({ error: 'UPSTREAM_ERROR' });
  }
  res.status(500).json({ error: 'INTERNAL_ERROR' });
}
