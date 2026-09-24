import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { prepareVariants } from '../services/productService.js';
import { getShippingCost } from '../services/orderService.js';
import { validateCreateOrder } from '../validators/orderValidator.js';

test('admin variant fields survive backend preparation and model validation', () => {
  const variantId = new mongoose.Types.ObjectId();
  const [variant] = prepareVariants([
    {
      _id: variantId,
      sku: 'TOP-001-NV-M',
      size: 'M',
      color: 'Navy',
      colorCode: 'NV',
      price: 790,
      stockQuantity: 4,
      imageUrl: '/products/navy.png',
      detailImages: ['/products/navy-back.png']
    }
  ]);

  const product = new Product({
    category_id: new mongoose.Types.ObjectId(),
    title: 'Test shirt',
    variants: [variant]
  });

  assert.equal(product.validateSync(), undefined);
  assert.equal(String(product.variants[0]._id), String(variantId));
  assert.equal(product.variants[0].size, 'M');
  assert.equal(product.variants[0].color, 'Navy');
  assert.equal(product.variants[0].colorCode, 'NV');
  assert.equal(product.variants[0].stock_quantity, 4);
  assert.deepEqual(product.variants[0].detailImages, ['/products/navy-back.png']);
});

test('shipping prices are calculated by the server', () => {
  assert.equal(getShippingCost('standard'), 0);
  assert.equal(getShippingCost('express'), 50);
  assert.equal(getShippingCost('priority'), 100);
  assert.throws(() => getShippingCost('free-for-attacker'), /Invalid shipping method/);
});

test('order validation rejects an unknown shipping method', () => {
  const result = validateCreateOrder({
    items: [{ productId: 'product', sku: 'sku', quantity: 1 }],
    shippingMethod: 'free-for-attacker',
    shippingAddress: {
      firstName: 'A',
      lastName: 'B',
      phone: '1',
      address: 'Street',
      city: 'Bangkok',
      zipCode: '10110'
    }
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /Shipping method/);
});

test('users start with token version zero for password revocation', () => {
  const user = new User({
    username: 'test-user',
    email: 'test@example.com',
    password: 'password'
  });

  assert.equal(user.tokenVersion, 0);
});
