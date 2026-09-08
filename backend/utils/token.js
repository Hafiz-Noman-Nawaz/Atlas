import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generate JWT token for user payload
 */
export function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
