import { verifyToken } from '../utils/token.js';
import { errorResponse } from '../utils/apiResponse.js';
import { User } from '../models/User.js';

export async function protect(req, res, next) {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. No token provided.', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return errorResponse(res, 'Invalid token payload.', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid authentication token.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Authentication token has expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Authentication failed.', 401);
  }
}
