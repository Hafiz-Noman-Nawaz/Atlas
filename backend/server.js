import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

async function startServer() {
  // Connect to Database
  await connectDB();

  // Start HTTP Server
  const server = app.listen(config.port, () => {
    console.log(`=============================================`);
    console.log(`🛡️  Shield Funding AI Backend Running`);
    console.log(`🚀 Port:        ${config.port}`);
    console.log(`🌐 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Health:     http://localhost:${config.port}/api/health`);
    console.log(`=============================================`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    console.error('[Unhandled Rejection]', err);
  });

  // Handle Uncaught Exceptions
  process.on('uncaughtException', (err) => {
    console.error('[Uncaught Exception]', err);
  });

  // Graceful Shutdown
  const shutdown = () => {
    console.log('[Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Server] Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
