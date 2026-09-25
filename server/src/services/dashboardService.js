import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';

function getTotalStock(product) {
  return product.variants.reduce((total, variant) => {
    const stock = variant.stock_quantity ?? variant.stockQuantity ?? 0;
    return total + stock;
  }, 0);
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
  const [products, customerCount, orders] = await Promise.all([
    Product.find().populate('category_id').lean(),
    User.countDocuments({ role: 'user' }),
    Order.find().lean()
  ]);
  const monthlyProducts = getLastSixMonths();
  const categoryMap = {};
  let totalStock = 0;
  let lowStockCount = 0;
  let activeProductCount = 0;
  let totalRevenue = 0;
  let pendingOrderCount = 0;

  const monthlyOrders = getLastSixMonths();

  orders.forEach((order) => {
    if (['paid', 'processing', 'shipped', 'completed'].includes(order.status)) {
      totalRevenue += order.totalAmount || 0;
    }
    if (order.status === 'pending') pendingOrderCount += 1;

    const createdDate = new Date(order.createdAt);
    const monthKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
    const matchingMonth = monthlyOrders.find((month) => month.key === monthKey);
    if (matchingMonth) matchingMonth.count += 1;
  });

  products.forEach((product) => {
    const productStock = getTotalStock(product);
    const isActive = product.is_active ?? product.isActive ?? true;
    const category = product.category_id?.slug || product.category || 'uncategorized';

    totalStock += productStock;
    if (isActive) activeProductCount += 1;
    if (isActive && productStock <= 10) lowStockCount += 1;
    categoryMap[category] = (categoryMap[category] || 0) + productStock;

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
    totalOrders: orders.length,
    pendingOrderCount,
    totalRevenue,
    stockByCategory,
    monthlyProducts: monthlyProducts.map(({ label, count }) => ({ label, count })),
    monthlyOrders: monthlyOrders.map(({ label, count }) => ({ label, count }))
  };
}
