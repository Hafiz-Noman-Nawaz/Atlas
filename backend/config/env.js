import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shield_funding_db',
  jwtSecret: process.env.JWT_SECRET || 'shield_funding_secure_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-004',
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
};
