import { config } from '../config/env.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * 404 Route Not Found middleware
 */
export function notFoundHandler(req, res, _next) {
  return errorResponse(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
}

/**
 * Centralized Global Error Handler
 */
export function errorHandler(err, _req, res, _next) {
  console.error('[Unhandled Error]', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, 'Validation Error', statusCode, errors);
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, `Duplicate value for ${field}. Please use another value.`, statusCode);
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    return errorResponse(res, `Invalid format for resource ID: ${err.value}`, statusCode);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
}
