import jwt from 'jsonwebtoken';
import { createClerkClient } from '@clerk/backend';
import { UserRepository } from '../models/repository.js';

const clerkClient = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

export async function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ detail: 'Not authenticated. Token is missing.' });
  }

  try {
    // 1. Check if token is a Clerk session token
    if (clerkClient) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.sub && (decoded.sub.startsWith('user_') || decoded.iss?.includes('clerk'))) {
          // It's a Clerk token
          const clerkUser = await clerkClient.users.getUser(decoded.sub);
          if (clerkUser) {
            const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress || `${clerkUser.id}@clerk.user`;
            const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || primaryEmail.split('@')[0];

            const user = await UserRepository.findOrCreateFromClerk({
              clerkId: clerkUser.id,
              email: primaryEmail,
              name,
            });

            req.user = user;
            return next();
          }
        }
      } catch (clerkErr) {
        console.warn('[Clerk Auth Note]', clerkErr.message);
      }
    }

    // 2. Fallback to standard JWT verification
    const secret = process.env.JWT_SECRET || 'atlas_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);

    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ detail: 'User not found or token has expired.' });
    }

    if (!user.isActive && user.is_active === false) {
      return res.status(403).json({ detail: 'This account has been deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth Middleware] Auth Error: ${error.message}`);
    return res.status(401).json({ detail: 'Invalid or expired token.' });
  }
}
