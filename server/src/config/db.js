import mongoose from "mongoose";
import { ENV } from "./env.js";

let isConnected = false;

// Track connection events
mongoose.connection.on("connected", () => {
  isConnected = true;
  console.log("✅ MongoDB Connection established");
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("⚠️ MongoDB Connection lost");
});

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
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

export const getDBStatus = () => {
  const readyState = mongoose.connection.readyState;
  return {
    isConnected: readyState === 1,
    readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    uri: ENV.MONGODB_URI
      ? `${ENV.MONGODB_URI.split("@").pop()}`
      : "Not configured",
  };
};

