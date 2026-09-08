import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin, configured clientUrl, or any *.vercel.app domain
      if (
        !origin ||
        origin === config.clientUrl ||
        origin.endsWith('.vercel.app') ||
        config.nodeEnv === 'development'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiting
app.use('/api', apiLimiter);

// API Router
app.use('/api', apiRouter);

// Root Welcome Endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Shield Funding AI Assistant API',
    version: '1.0.0',
    status: 'online',
    docs: '/api/health',
  });
});

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
