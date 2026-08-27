/**
 * Custom 404 Not Found Middleware.
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({ detail: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Global Error Handler Middleware.
 */
export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      detail: `An account with this ${field} already exists.`,
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      detail: messages.join(', '),
    });
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      detail: `Invalid identifier format: ${err.value}`,
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    detail: err.message || 'Internal Server Error',
  });
}
