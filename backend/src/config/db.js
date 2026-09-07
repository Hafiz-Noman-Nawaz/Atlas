import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export let isMongoConnected = false;
let cachedConnection = null;

/**
 * Connects to MongoDB using Mongoose.
 * 1. Reuses cached connection across warm serverless lambdas.
 * 2. Tries the specified MONGODB_URI (e.g. MongoDB Atlas).
 * 3. If not reachable, logs a clear message and falls back to in-memory local storage.
 */
export async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/atlas_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isMongoConnected = true;
    cachedConnection = conn;
    console.log(`[MongoDB] 🍃 Connected successfully to MongoDB Atlas (${conn.connection.host}/${conn.connection.name})`);
    return conn;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] Primary MongoDB not reachable: ${error.message}`);
    console.log(`[Database] 💡 Running with Fast Built-in Local Storage.`);
    return null;
  }
}

