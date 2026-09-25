import 'dotenv/config';
import mongoose from 'mongoose';
import { Category, Product } from '../models/index.js';
import { buildDefaultSizeChart } from '../utils/defaultSizeCharts.js';

async function backfillSizeCharts() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI');
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  const products = await Product.find({
    $or: [
      { size_chart: { $exists: false } },
      { size_chart: { $size: 0 } }
    ]
  }).populate('category_id');
  const dryRun = process.argv.includes('--dry-run');

  let updatedCount = 0;
  for (const product of products) {
    const sizeChart = buildDefaultSizeChart(product);
    if (sizeChart.length === 0) {
      console.warn(`⚠️ Skipped product without a supported category or size: ${product.productId || product._id}`);
      continue;
    }

    if (!dryRun) {
      product.size_chart = sizeChart;
      await product.save();
    }
    updatedCount += 1;
    console.log(`${dryRun ? '🔎 Ready' : '✅ Added'} size chart: ${product.productId || product.title}`);
  }

  const action = dryRun ? 'ready to update' : 'updated';
  console.log(`✅ Size charts ${action}: ${updatedCount}/${products.length}`);
}

try {
  await backfillSizeCharts();
} catch (error) {
  console.error(`❌ Size chart backfill failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
