import mongoose from "mongoose";
import { ENV } from "./env.js";

let isConnected = false;
let connecting = false;
let reconnectTimer = null;
let reconnectEnabled = true;

const RECONNECT_DELAY_MS = 5000;

function parsePoolSetting(value, fallback, minimum) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= minimum ? parsed : fallback;
}

export function buildMongoOptions(env = ENV) {
  const maxPoolSize = parsePoolSetting(env.MONGODB_MAX_POOL_SIZE, 3, 1);
  const requestedMinPoolSize = parsePoolSetting(env.MONGODB_MIN_POOL_SIZE, 0, 0);

  return {
    serverSelectionTimeoutMS: 10000,
    bufferCommands: true,
    maxPoolSize,
    minPoolSize: Math.min(requestedMinPoolSize, maxPoolSize),
    maxIdleTimeMS: parsePoolSetting(env.MONGODB_MAX_IDLE_TIME_MS, 60000, 10000),
    waitQueueTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
  };
}

function scheduleReconnect() {
  if (!reconnectEnabled || reconnectTimer || connecting) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await connectDB();
  }, RECONNECT_DELAY_MS);
}



export const connectDB = async () => {
  reconnectEnabled = true;
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (connecting) return;
  connecting = true;

  // Fail fast instead of buffering queries for 10s+ when DB is offline,
  // so requests get an error quickly and auto-reconnect can restore service.
  mongoose.set("bufferCommands", true);
  mongoose.set("bufferTimeoutMS", 3000);

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, buildMongoOptions());
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

export const disconnectDB = async () => {
  reconnectEnabled = false;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  await mongoose.disconnect();
  isConnected = false;
};

// Lifetime connection monitoring: restore service automatically if the
// MongoDB connection drops after startup (idle pause, network blip, ...).
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connection restored: connected");
  isConnected = true;
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  if (reconnectEnabled) {
    console.warn("⚠️  MongoDB disconnected, reconnecting in background...");
    scheduleReconnect();
  }
});

mongoose.connection.on("error", (error) => {
  console.warn(`⚠️  MongoDB connection error: ${error.message}`);
  isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) scheduleReconnect();
});

export const getDBStatus = () => {
  const readyState = mongoose.connection.readyState;
  return {
    isConnected: readyState === 1 || isConnected,
    readyState,
  };
};
