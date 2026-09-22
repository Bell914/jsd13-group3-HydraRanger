import mongoose from "mongoose";
import { ENV } from "./env.js";

let isConnected = false;
let connecting = false;
let reconnectTimer = null;

const RECONNECT_DELAY_MS = 5000;

function scheduleReconnect() {
  if (reconnectTimer || connecting) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await connectDB();
  }, RECONNECT_DELAY_MS);
}

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (connecting) return;
  connecting = true;

  // Fail fast instead of buffering queries for 10s+ when DB is offline,
  // so requests get an error quickly and auto-reconnect can restore service.
  mongoose.set("bufferCommands", true);
  mongoose.set("bufferTimeoutMS", 3000);

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: true,
      maxPoolSize: 10,
      minPoolSize: 1,
      heartbeatFrequencyMS: 10000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Notice: ${error.message}`);
    isConnected = false;
    scheduleReconnect();
  } finally {
    connecting = false;
  }
};

// Lifetime connection monitoring: restore service automatically if the
// MongoDB connection drops after startup (idle pause, network blip, ...).
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connection restored: connected");
  isConnected = true;
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected, reconnecting in background...");
  isConnected = false;
  scheduleReconnect();
});

mongoose.connection.on("error", (error) => {
  console.warn(`⚠️  MongoDB connection error: ${error.message}`);
  isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) scheduleReconnect();
});

export const getDBStatus = () => ({
  isConnected,
  uri: ENV.MONGODB_URI
    ? `${ENV.MONGODB_URI.split("@").pop()}`
    : "Not configured",
});