import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDefaultSizeChart } from '../utils/defaultSizeCharts.js';

test('builds a top size chart from the sizes sold by the product', () => {
  const chart = buildDefaultSizeChart({
    category: 'tops',
    variants: [{ size: 'M' }, { size: 'S' }, { size: 'M' }]
  });

  assert.deepEqual(chart, [
    { size_name: 'S', garment_chest_actual: 96 },
    { size_name: 'M', garment_chest_actual: 104 }
  ]);
});

test('builds a bottom size chart with waist and hips measurements', () => {
  const chart = buildDefaultSizeChart({
    category_id: { slug: 'bottoms' },
    variants: [{ size_or_color: 'S' }, { size_or_color: 'L' }]
  });

  assert.deepEqual(chart, [
    { size_name: 'S', garment_waist_actual: 78, garment_hips_actual: 100 },
    { size_name: 'L', garment_waist_actual: 94, garment_hips_actual: 116 }
  ]);
});

test('skips variant labels that are not supported sizes', () => {
  assert.deepEqual(buildDefaultSizeChart({
    category: 'tops',
    variants: [{ size: 'One Size' }, { color: 'Black' }]
  }), []);
});

test('does not guess a chart when the product category is missing', () => {
  assert.deepEqual(buildDefaultSizeChart({ variants: [{ size: 'M' }] }), []);
});
