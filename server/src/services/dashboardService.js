import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

function getTotalStock(product) {
  return product.variants.reduce((total, variant) => total + variant.stockQuantity, 0);
}

function getLastSixMonths() {
  const months = [];
  const today = new Date();

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('th-TH', { month: 'short' }),
      count: 0
    });
  }

  return months;
}

export async function getDashboardSummary() {
  const products = await Product.find().lean();
  const customerCount = await User.countDocuments({ role: 'user' });
  const monthlyProducts = getLastSixMonths();
  const categoryMap = {};
  let totalStock = 0;
  let lowStockCount = 0;
  let activeProductCount = 0;

  products.forEach((product) => {
    const productStock = getTotalStock(product);
    totalStock += productStock;
    if (product.isActive) activeProductCount += 1;
    if (product.isActive && productStock <= 10) lowStockCount += 1;
    categoryMap[product.category] = (categoryMap[product.category] || 0) + productStock;

    const createdDate = new Date(product.createdAt);
    const monthKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
    const matchingMonth = monthlyProducts.find((month) => month.key === monthKey);
    if (matchingMonth) matchingMonth.count += 1;
  });

  const stockByCategory = Object.entries(categoryMap).map(([category, stock]) => ({ category, stock }));

  return {
    totalProducts: products.length,
    activeProductCount,
    inactiveProductCount: products.length - activeProductCount,
    totalStock,
    lowStockCount,
    customerCount,
    stockByCategory,
    monthlyProducts: monthlyProducts.map(({ label, count }) => ({ label, count }))
  };
}
