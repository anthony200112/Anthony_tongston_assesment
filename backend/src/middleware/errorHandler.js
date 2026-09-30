import env from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Central error handler. Mounted last so every thrown/next(err) lands here.
 * Never leaks stack traces in production.
 */
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error.';

  if (status >= 500) {
    logger.error('Unhandled server error', {
      path: req.path,
      method: req.method,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(status).json({
    error: status >= 500 && env.isProduction ? 'Internal server error.' : message,
  });
}

/**
 * 404 handler for unmatched routes.
 */
export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}
