import app from '../app.js';
import { connectDB } from '../config/db.js';

/**
 * Vercel Serverless Function Handler
 */
export default async function handler(req, res) {
  try {
    // Ensure MongoDB connection is established / reused
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] DB connection error:', err);
  }

  // Forward request to Express application
  return app(req, res);
}
