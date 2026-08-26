import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start HTTP Server
  const server = app.listen(ENV.PORT, () => {
    console.log('====================================================');
    console.log(`OCCASION API Server running on port: ${ENV.PORT}`);
    console.log(`📡 Environment: ${ENV.NODE_ENV}`);
    console.log(`🔗 Local URL: http://localhost:${ENV.PORT}`);
    console.log(`🩺 Health Check: http://localhost:${ENV.PORT}/api/health`);
    console.log('====================================================');
  });

  // Graceful shutdown handling
  const handleShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('🏁 HTTP Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
