import test from 'node:test';
import assert from 'node:assert/strict';
import { validateIdParam, validateProductIdParam } from '../validators/commonValidator.js';
import { validateContactInput } from '../validators/contactValidator.js';
import { validateCustomerStatus } from '../validators/customerValidator.js';
import { validateCreateOrder, validateOrderStatus } from '../validators/orderValidator.js';
import { validateReviewInput } from '../validators/reviewValidator.js';

test('order requires items and a complete shipping address', () => {
  const result = validateCreateOrder({ items: [], shippingAddress: {} });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.length >= 2);
});

test('order status rejects an unknown value', () => {
  assert.equal(validateOrderStatus({ status: 'unknown' }).isValid, false);
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
