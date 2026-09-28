import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { prepareVariants } from '../services/productService.js';
import { getShippingCost } from '../services/orderService.js';
import { validateCreateOrder } from '../validators/orderValidator.js';
import { validateUpdateProfileInput } from '../validators/authValidator.js';
import { buildCouponsForUser, validateCouponForUser } from '../services/couponService.js';

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

test('coupon API derives membership and birthday eligibility on the server', () => {
  const now = new Date('2026-09-15T12:00:00.000Z');
  const user = { birthMonth: 9, membership: { rank: 'SILVER' } };
  const coupons = buildCouponsForUser(user, [], now);

  assert.deepEqual(coupons.map((coupon) => coupon.code), [
    'OCCWELCOME10', 'SILVERVIP5', 'BDAY15', 'OCCFREESHIP'
  ]);
  assert.equal(coupons.find((coupon) => coupon.code === 'BDAY15').usable, true);
  assert.throws(
    () => validateCouponForUser(user, 'GOLDVIP10', 1000, [], now),
    /not available for this membership/
  );
});

test('redeemed and out-of-month coupons cannot be reused', () => {
  const now = new Date('2026-09-15T12:00:00.000Z');
  const user = { birthMonth: 2, membership: { rank: 'BRONZE' } };
  const redemptions = [{ code: 'OCCWELCOME10', campaignKey: 'lifetime' }];
  const coupons = buildCouponsForUser(user, redemptions, now);

  assert.equal(coupons.find((coupon) => coupon.code === 'OCCWELCOME10').usable, false);
  assert.equal(coupons.find((coupon) => coupon.code === 'BDAY10').usable, false);
  assert.throws(
    () => validateCouponForUser(user, 'OCCWELCOME10', 1000, redemptions, now),
    /ใช้สิทธิ์นี้แล้ว/
  );
});

test('profile validation accepts only a valid birth month', () => {
  assert.equal(validateUpdateProfileInput({ birthMonth: 9 }).isValid, true);
  assert.equal(validateUpdateProfileInput({ birthMonth: null }).isValid, true);
  assert.equal(validateUpdateProfileInput({ birthMonth: 13 }).isValid, false);
});
