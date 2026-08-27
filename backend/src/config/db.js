import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export let isMongoConnected = false;

/**
 * Connects to MongoDB using Mongoose.
 * 1. Tries the specified MONGODB_URI (e.g. MongoDB Atlas or local MongoDB).
 * 2. If not reachable, logs a clear message and uses the fast local in-memory fallback.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/atlas_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    isMongoConnected = true;
    console.log(`[MongoDB] 🍃 Connected successfully to MongoDB Atlas (${conn.connection.host}/${conn.connection.name})`);
    return conn;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] Primary MongoDB not reachable: ${error.message}`);
    console.log(`[Database] 💡 Running with Fast Built-in Local Storage.`);
    return null;
  }
}
