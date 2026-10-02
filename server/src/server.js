import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { cleanupExpiredPendingPayments } from "./services/orderService.js";

const PAYMENT_CLEANUP_INTERVAL = 60 * 1000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Release stock held by orders whose payment was never confirmed within 30 minutes.
  await cleanupExpiredPendingPayments().catch((error) => {
    console.error("Could not clean up expired payments:", error);
  });
  const paymentCleanupTimer = setInterval(() => {
    cleanupExpiredPendingPayments().catch((error) => {
      console.error("Could not clean up expired payments:", error);
    });
  }, PAYMENT_CLEANUP_INTERVAL);
  paymentCleanupTimer.unref();

  // Start HTTP Server
  const server = app.listen(ENV.PORT, () => {
    console.log("====================================================");
    console.log(`OCCASION API Server running on port: ${ENV.PORT}`);
    console.log(`📡 Environment: ${ENV.NODE_ENV}`);
    console.log(`🔗 Local URL: http://localhost:${ENV.PORT}`);
    console.log(`🩺 Health Check: http://localhost:${ENV.PORT}/api/health`);
    console.log("====================================================");
  });

  // Graceful shutdown handling
  let shutdownStarted = false;
  const handleShutdown = (signal) => {
    if (shutdownStarted) return;
    shutdownStarted = true;
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    clearInterval(paymentCleanupTimer);
    server.close(async () => {
      try {
        await disconnectDB();
        console.log("🏁 HTTP Server and MongoDB connection closed.");
        process.exit(0);
      } catch (error) {
        console.error("Could not close MongoDB cleanly:", error);
        process.exit(1);
      }
    });
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
};

startServer();
