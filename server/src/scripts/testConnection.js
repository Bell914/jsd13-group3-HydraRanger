import { connectDB, getDBStatus } from '../config/db.js';
import { ENV } from '../config/env.js';

const test = async () => {
  const safeDatabaseUri = ENV.MONGODB_URI.replace(
    /(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+@/,
    '$1***@'
  );

  console.log('🧪 Testing Server & Database Configuration...');
  console.log(`📌 Port: ${ENV.PORT}`);
  console.log(`📌 Environment: ${ENV.NODE_ENV}`);
  console.log(`📌 Target DB URI: ${safeDatabaseUri}`);

  await connectDB();
  console.log('Status:', getDBStatus());
  process.exit(0);
};

test();
