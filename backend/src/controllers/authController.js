import jwt from 'jsonwebtoken';
import { UserRepository } from '../models/repository.js';

function generateToken(userId) {
  const secret = process.env.JWT_SECRET || 'atlas_super_secret_jwt_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId.toString() }, secret, { expiresIn });
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ detail: 'Please provide name, email, and password.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ detail: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ detail: 'An account with this email already exists.' });
    }

    const user = await UserRepository.create({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    const token = generateToken(user._id || user.id);

    return res.status(201).json({
      access_token: token,
      token_type: 'bearer',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ detail: 'Please provide email and password.' });
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ detail: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ detail: 'Invalid email or password.' });
    }

    if (user.isActive === false || user.is_active === false) {
      return res.status(403).json({ detail: 'This account has been deactivated.' });
    }

    const token = generateToken(user._id || user.id);

    return res.json({
      access_token: token,
      token_type: 'bearer',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export async function getMe(req, res, next) {
  try {
    return res.json(req.user.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * @route   PATCH /api/auth/me
 * @desc    Update profile name, nickname, or avatar
 * @access  Private
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, nickname, avatar_url } = req.body;
    const userId = req.user._id || req.user.id;

    const updatedUser = await UserRepository.updateProfile(userId, {
      name,
      nickname,
      avatarUrl: avatar_url,
    });

    if (!updatedUser) {
      return res.status(404).json({ detail: 'User not found.' });
    }

    return res.json(updatedUser.toJSON());
  } catch (error) {
    next(error);
  }
}

/**
 * @route   DELETE /api/auth/me
 * @desc    Permanently delete user account and associated data
 * @access  Private
 */
export async function deleteAccount(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    await UserRepository.deleteAccount(userId);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

