import test from 'node:test';
import assert from 'node:assert/strict';
import { validateIdParam, validateProductIdParam } from '../validators/commonValidator.js';
import { validateContactInput } from '../validators/contactValidator.js';
import { validateCustomerStatus } from '../validators/customerValidator.js';
import { validateCreateOrder, validateOrderStatus } from '../validators/orderValidator.js';
import { validateReviewInput } from '../validators/reviewValidator.js';
import { validateProductInput } from '../validators/productValidator.js';
import { validateResetPasswordInput } from '../validators/authValidator.js';
import { validateArticleInput, validateArticleStatus } from '../validators/articleValidator.js';

test('order requires items and a complete shipping address', () => {
  const result = validateCreateOrder({ items: [], shippingAddress: {} });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.length >= 2);
});

test('order status rejects an unknown value', () => {
  assert.equal(validateOrderStatus({ status: 'unknown' }).isValid, false);
  assert.equal(validateOrderStatus({ status: 'refunded' }).isValid, true);
});

test('password reset requires at least eight characters', () => {
  assert.equal(validateResetPasswordInput({ password: '1234567' }).isValid, false);
  assert.equal(validateResetPasswordInput({ password: '12345678' }).isValid, true);
});

test('product size chart rejects duplicate sizes and invalid measurements', () => {
  const result = validateProductInput({
    name: 'Shirt',
    description: 'Cotton shirt',
    category: 'tops',
    tags: ['shirt'],
    availableDate: '2026-09-24',
    variants: [{ sku: 'SHIRT-S', size: 'S', price: 490, stockQuantity: 1 }],
    size_chart: [
      { size_name: 'S', garment_chest_actual: 0 },
      { size_name: 'S', garment_chest_actual: 100 }
    ]
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.some((error) => error.includes('duplicate size')));
});

test('bottom size chart requires waist and hips instead of chest', () => {
  const result = validateProductInput({
    name: 'Pants', category: 'bottoms',
    description: 'Relaxed pants',
    tags: ['pants'],
    availableDate: '2026-09-24',
    variants: [{ sku: 'PANTS-M', size: 'M', price: 790, stockQuantity: 1 }],
    size_chart: [{ size_name: 'M', garment_waist_actual: 78, garment_hips_actual: 104 }]
  });
  assert.equal(result.isValid, true);
});

test('product requires the six rubric fields on the server', () => {
  const result = validateProductInput({
    name: 'Incomplete product',
    category: 'tops',
    variants: [{ sku: 'INCOMPLETE-S', size: 'S', price: 490 }]
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.includes('Product description is required'));
  assert.ok(result.errors.includes('At least one product tag is required'));
  assert.ok(result.errors.includes('Product available date is required'));
  assert.ok(result.errors.includes('Variant 1: stock is required'));
});

test('product accepts all six rubric fields with zero stock', () => {
  const result = validateProductInput({
    name: 'Complete product', description: 'Complete description', category: 'tops',
    tags: ['new'], availableDate: '2026-09-24',
    variants: [{ sku: 'COMPLETE-S', size: 'S', price: 490, stockQuantity: 0 }]
  });
  assert.equal(result.isValid, true);
});

test('customer status only accepts a boolean', () => {
  assert.equal(validateCustomerStatus({ isActive: 'false' }).isValid, false);
  assert.equal(validateCustomerStatus({ isActive: false }).isValid, true);
});

test('review rejects an invalid rating and IDs', () => {
  const result = validateReviewInput({
    orderId: 'bad-id',
    productId: 'bad-id',
    rating: 6,
    comment: 'ok review'
  });
  assert.equal(result.isValid, false);
});

test('contact form rejects an invalid email and short message', () => {
  const result = validateContactInput({
    name: 'Test User',
    email: 'not-email',
    topic: 'Help',
    message: 'short'
  });
  assert.equal(result.isValid, false);
});

test('ID validator accepts only a 24-character MongoDB ID', () => {
  assert.equal(validateIdParam({ id: '507f1f77bcf86cd799439011' }).isValid, true);
  assert.equal(validateIdParam({ id: '123' }).isValid, false);
});

test('product ID parameter validator rejects malformed IDs', () => {
  assert.equal(validateProductIdParam({ productId: 'bad-id' }).isValid, false);
});
test('article requires its public content and accepts a valid draft', () => {
  const missingContent = validateArticleInput({ title: 'New article' });
  assert.equal(missingContent.isValid, false);
  assert.ok(missingContent.errors.includes('Content is required'));

  const draft = validateArticleInput({
    title: 'New article',
    excerpt: 'Short introduction',
    content: 'Full article content',
    category: 'Style Guide',
    imageUrl: '/api/uploads/507f1f77bcf86cd799439011',
    isPublished: false,
  });
  assert.equal(draft.isValid, true);
  assert.equal(validateArticleStatus({ isPublished: 'yes' }).isValid, false);
});
