import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { ENV } from '../config/env.js';
import { User, Item, Product, Lookbook } from '../models/index.js';
import { productSeedData } from '../data/productSeedData.js';
import seedData from '../data/seedData.json' with { type: 'json' };
import lookData from '../../../client/public/collection-2026/look-data.json' with { type: 'json' };

const { initialUsers, initialItems } = seedData;

// 1. Seed Users (Upsert)
async function seedUsers() {
  const users = [];

  for (const userData of initialUsers) {
    let user = await User.findOne({ email: userData.email.toLowerCase() });

    // กำหนด Password: ถ้าเป็น Admin ให้ใช้ ADMIN_PASSWORD จาก ENV ถ้าไม่ใช่ใช้ Default
    const defaultPassword = userData.role === 'admin' 
      ? (ENV.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD)
      : (process.env.SEED_USER_PASSWORD || 'Password123!');

    if (!defaultPassword) {
      throw new Error(`Missing password configuration for role: ${userData.role}`);
    }

    if (!user) {
      user = await User.create({
        ...userData,
        email: userData.email.toLowerCase(),
        password: defaultPassword
      });
    } else {
      user.username = userData.username;
      user.role = userData.role;
      await user.save();
    }

    users.push(user);
  }

  console.log(`✅ Users ready: ${users.length}`);
  return users;
}

// 2. Seed Items (Upsert)
async function seedItems(users) {
  for (let index = 0; index < initialItems.length; index += 1) {
    const item = initialItems[index];
    const itemData = {
      title: item.title,
      description: item.description,
      category: item.category,
      status: item.status,
      priority: item.priority,
      creatorName: item.creatorName,
      createdBy: users[index % users.length]._id
    };
    await Item.updateOne(
      { title: item.title },
      { $set: itemData },
      { upsert: true, runValidators: true }
    );
  }

  console.log(`✅ Items ready: ${initialItems.length}`);
}

// 3. Seed Products (Upsert)
async function seedProducts() {
  const products = [];

  for (const productData of productSeedData) {
    const product = await Product.findOneAndUpdate(
      { productId: productData.productId },
      { $set: productData },
      { upsert: true, new: true, runValidators: true }
    );
    products.push(product);
  }

  console.log(`✅ Products ready: ${products.length}`);
  return products;
}

// Helper Function
function getProductIdFromNumber(productNumber) {
  if (productNumber <= 5) {
    return `top-00${productNumber}`;
  }
  return `bottom-00${productNumber - 5}`;
}

// 4. Seed Lookbooks (Upsert)
async function seedLookbooks(products) {
  const productMap = new Map();
  products.forEach((product) => productMap.set(product.productId, product._id));

  for (const look of lookData.looks) {
    const items = look.items.map((item) => {
      const productId = getProductIdFromNumber(item.productId);
      return {
        product: productMap.get(productId),
        defaultVariantSku: `${item.sku}-${item.colorCode}-S`
      };
    });

    const imageFileName = look.image.split('/').pop();
    const lookbook = {
      lookbookId: look.id,
      name: look.name,
      nameTh: look.nameTh,
      concept: look.concept,
      occasion: look.occasion,
      styleTags: look.styleTags,
      imageUrl: `/collection-2026/lookbook/${imageFileName}`,
      items,
      regularPrice: look.regularPrice,
      setPrice: look.setPrice,
      saving: look.saving,
      isActive: true
    };

    await Lookbook.updateOne(
      { lookbookId: look.id },
      { $set: lookbook },
      { upsert: true, runValidators: true }
    );
  }

  console.log(`✅ Lookbooks ready: ${lookData.looks.length}`);
}

// Main Runner Function
async function runSeed() {
  console.log('🌱 Starting safe database seed...');
  await connectDB();

  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB is not connected');
    }

    const users = await seedUsers();
    await seedItems(users);
    const products = await seedProducts();
    await seedLookbooks(products);
    
    console.log('🎉 Database seed completed without deleting existing data');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

runSeed();