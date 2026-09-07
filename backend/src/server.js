import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB, isMongoConnected } from './config/db.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const APP_NAME = process.env.APP_NAME || 'ZeoAtlas';

// Ensure uploads folder exists (safe for serverless / read-only filesystems)
const uploadsDir = path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  // Ignored in read-only serverless lambdas
}

// Ensure database connection on serverless cold-starts
app.use(async (req, res, next) => {
  if (!isMongoConnected) {
    try {
      await connectDB();
    } catch (e) {
      // Non-blocking fallback
    }
  }
  next();
});

// Initial DB connection attempt for local & warm start
connectDB().catch(() => {});

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.includes('zeoatlas')
      ) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin: ${origin} not in allowedOrigins:`, allowedOrigins);
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());

// Body Parser Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve local uploads statically with browser caching
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', immutable: true }));

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Root Status Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: APP_NAME,
    message: 'ZeoAtlas Backend API is running smoothly.',
    healthCheck: '/api/health',
    documentation: '/api',
    timestamp: new Date().toISOString(),
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: APP_NAME,
    database: isMongoConnected ? 'connected' : 'local_storage',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server locally (Vercel automatically executes handler directly)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 ${APP_NAME} Server running on http://localhost:${PORT}`);
    console.log(`📦 Chatbot Mode: ${process.env.CHATBOT_MODE || 'hybrid'}`);
    console.log(`📁 Uploads Serving: /uploads`);
    console.log(`🌐 Allowed CORS: ${allowedOrigins.join(', ')}`);
    console.log(`========================================`);
  });
}

export default app;

