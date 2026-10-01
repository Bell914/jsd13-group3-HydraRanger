import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProductForm } from './productValidation.js';

function validForm() {
  return {
    name: 'Portfolio Shirt', description: 'A complete product description',
    tags: 'portfolio, demo', availableDate: '2026-09-28',
    variants: [{ sku: 'PORT-S', color: 'Black', price: '590', stockQuantity: '5' }],
    sizeChart: [{ sizeName: 'S', garmentChestActual: '96' }]
  };
}

test('accepts valid values for the six required product fields', () => {
  assert.deepEqual(validateProductForm(validForm()), {});
});

test('reports field-specific errors for blank or wrongly typed values', () => {
  const result = validateProductForm({
    ...validForm(), name: ' ', description: '', tags: ' , ', availableDate: 'not-a-date',
    variants: [{ sku: '', color: '', price: 'free', stockQuantity: '1.5' }]
  });
  assert.ok(result.name);
  assert.ok(result.description);
  assert.ok(result.tags);
  assert.ok(result.availableDate);
  assert.ok(result['variant-0-price']);
  assert.ok(result['variant-0-stock']);
});
