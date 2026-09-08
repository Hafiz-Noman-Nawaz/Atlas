import { User } from '../models/User.js';
import { generateToken } from '../utils/token.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email, and password', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists', 400);
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Generate token
    const token = generateToken({ id: user._id, email: user.email });

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({ id: user._id, email: user.email });

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
      'Login successful',
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export async function getMe(req, res, next) {
  try {
    return successResponse(
      res,
      {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
        },
      },
      'User profile retrieved',
      200
    );
  } catch (error) {
    next(error);
  }
}
