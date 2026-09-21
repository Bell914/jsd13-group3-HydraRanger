import mongoose from "mongoose";
import { ENV } from "./env.js";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  // Fail fast instead of buffering queries for 10s+ when DB is offline,
  // so the in-memory fallback service can kick in quickly.
  mongoose.set("bufferCommands", true);
  mongoose.set("bufferTimeoutMS", 3000);

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: true,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Notice: ${error.message}`);
    console.warn(
      "ℹ️  Server will utilize In-Memory Fallback Service until MongoDB instance is connected.",
    );
    isConnected = false;
  }
};

export const getDBStatus = () => ({
  isConnected,
  uri: ENV.MONGODB_URI
    ? `${ENV.MONGODB_URI.split("@").pop()}`
    : "Not configured",
});
