import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { ENV } from '../config/env.js';
import { User, Item, Product, Lookbook, Category, Article } from '../models/index.js';
import { productSeedData } from '../data/productSeedData.js';
import { articleSeedData } from '../data/articleSeedData.js';
import seedData from '../data/seedData.json' with { type: 'json' };
import lookData from '../../../client/public/collection-2026/look-data.json' with { type: 'json' };
import { buildDefaultSizeChart } from '../utils/defaultSizeCharts.js';

const { initialUsers, initialItems } = seedData;

async function seedUsers() {
  const users = [];

  for (const userData of initialUsers) {
    let user = await User.findOne({ email: userData.email.toLowerCase() });

    if (!user) {
      const passwordVariable = userData.role === 'admin'
        ? 'SEED_ADMIN_PASSWORD'
        : 'SEED_USER_PASSWORD';
      const password = userData.role === 'admin'
        ? (ENV.ADMIN_PASSWORD || process.env[passwordVariable])
        : process.env[passwordVariable];

      if (!password) {
        throw new Error(`Missing ${passwordVariable} for database seed`);
      }

      user = await User.create({ ...userData, email: userData.email.toLowerCase(), password });
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

async function seedProducts() {
  const products = [];

  // Ensure categories exist
  const categories = [
    { name: 'Tops', slug: 'tops' },
    { name: 'Bottoms', slug: 'bottoms' }
  ];
  const categoryMap = new Map();
  for (const cat of categories) {
    const categoryDoc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $setOnInsert: cat },
      { upsert: true, new: true }
    );
    categoryMap.set(cat.slug, categoryDoc._id);
  }

  for (const raw of productSeedData) {
    const categoryId = categoryMap.get(raw.category);
    const variants = raw.variants.map((v) => ({
      sku: v.sku,
      size_or_color: v.size || v.color || 'Standard',
      color: v.color || 'Standard',
      colorCode: v.colorCode || '',
      size: v.size || 'S',
      price: v.price,
      stock_quantity: v.stockQuantity ?? v.stock_quantity ?? 0,
      imageUrl: v.imageUrl || '',
      detailImages: v.detailImages || []
    }));

    const imageUrls = [raw.imageUrl];
    for (const v of raw.variants || []) {
      if (v.imageUrl) imageUrls.push(v.imageUrl);
      if (Array.isArray(v.detailImages)) imageUrls.push(...v.detailImages);
    }
    const images = [...new Set(imageUrls.filter(Boolean))].map((url, idx) => ({
      image_url: url,
      display_order: idx
    }));

    const productPayload = {
      productId: raw.productId,
      category_id: categoryId,
      title: raw.name,
      description: raw.description,
      gender: raw.gender || 'unisex',
      tags: raw.tags || [],
      availableDate: raw.availableDate,
      is_active: raw.isActive ?? true,
      images,
      variants,
      size_chart: buildDefaultSizeChart({ category: raw.category, variants })
    };

    const product = await Product.findOneAndUpdate(
      { productId: raw.productId },
      { $set: productPayload },
      { upsert: true, new: true, runValidators: true }
    );
    products.push(product);
  }

  console.log(`✅ Products ready: ${products.length}`);
  return products;
}

function getProductIdFromNumber(productNumber) {
  if (productNumber <= 5) {
    return `top-00${productNumber}`;
  }
  return `bottom-00${productNumber - 5}`;
}

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

async function seedArticles() {
  for (const articleData of articleSeedData) {
    await Article.updateOne(
      { articleId: articleData.articleId },
      { $set: { ...articleData, isPublished: articleData.isPublished ?? true } },
      { upsert: true, runValidators: true }
    );
  }

  console.log(`✅ Articles ready: ${articleSeedData.length}`);
}

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
    await seedArticles();
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
