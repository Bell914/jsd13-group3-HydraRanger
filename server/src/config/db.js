import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Notice: ${error.message}`);
    console.warn('ℹ️  Server will utilize In-Memory Fallback Service until MongoDB instance is connected.');
    isConnected = false;
  }
};

export const getDBStatus = () => ({
  isConnected,
  uri: ENV.MONGODB_URI ? `${ENV.MONGODB_URI.split('@').pop()}` : 'Not configured'
});
