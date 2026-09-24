import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProduct, prepareProduct } from '../services/productService.js';
import { getNextStatuses } from '../utils/orderStatus.js';

test('admin maps size chart and active state from API data', () => {
  const product = normalizeProduct({
    title: 'Easy Pants', category: 'bottoms', is_active: false,
    size_chart: [{ size_name: 'M', garment_waist_actual: 78, garment_hips_actual: 104 }],
    variants: []
  });
  assert.equal(product.isActive, false);
  assert.deepEqual(product.sizeChart[0], {
    sizeName: 'M', garmentChestActual: '', garmentWaistActual: 78, garmentHipsActual: 104
  });
});

test('admin prepares bottom measurements for the product API', () => {
  const payload = prepareProduct({
    name: 'Easy Pants', description: 'pants', category: 'bottoms', gender: 'unisex',
    tags: ['easy'], availableDate: '2026-09-23', imageUrl: '', isActive: true,
    sizeChart: [{ sizeName: 'M', garmentChestActual: '', garmentWaistActual: '78', garmentHipsActual: '104' }],
    variants: [{ sku: 'P-M', color: 'Black', colorCode: 'BK', size: 'M', price: 900, stockQuantity: 2 }]
  });
  assert.deepEqual(payload.size_chart, [
    { size_name: 'M', garment_waist_actual: 78, garment_hips_actual: 104 }
  ]);
});

test('admin only offers valid next order states', () => {
  assert.deepEqual(getNextStatuses('shipped'), ['shipped', 'completed', 'refunded']);
  assert.deepEqual(getNextStatuses('cancelled'), ['cancelled']);
});
