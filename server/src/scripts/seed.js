import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User, Item } from '../models/index.js';
import { initialUsers, initialItems } from '../data/seedData.json' with { type: 'json' };

const runSeed = async () => {
  console.log('🌱 Starting Database Seeding...');
  await connectDB();

  try {
    // Clear existing collections if connected
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({});
      await Item.deleteMany({});

      const createdUsers = await User.create(
        initialUsers.map((u) => ({
          ...u,
          password: 'Password123!'
        }))
      );
      console.log(`✅ Seeded ${createdUsers.length} Users`);

      const createdItems = await Item.create(
        initialItems.map((item, idx) => ({
          ...item,
          createdBy: createdUsers[idx % createdUsers.length]._id
        }))
      );
      console.log(`✅ Seeded ${createdItems.length} Items`);
      console.log('🎉 Seeding completed successfully!');
    } else {
      console.log('ℹ️  MongoDB not connected. Mock database is ready in memory.');
    }
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
    process.exit(0);
  }
};

runSeed();
