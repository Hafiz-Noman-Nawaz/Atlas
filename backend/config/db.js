import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;
let cachedPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  try {
    cachedPromise = mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });

    const conn = await cachedPromise;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    cachedPromise = null;
    console.error(`[MongoDB] Connection error:`, error.message);
    return null;
  }
}

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('[MongoDB] Connection state: Connected');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('[MongoDB] Connection error event:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('[MongoDB] Connection state: Disconnected');
});

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
