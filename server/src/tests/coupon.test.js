import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Coupon } from '../models/couponModel.js';
import { validateCoupon, claimCouponAtomically, refundCouponUsage } from '../services/couponService.js';
import { createOrder } from '../services/orderService.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

test('shared WELCOME5 code resolves the owning account even when another account used it', async (t) => {
  const userA = new mongoose.Types.ObjectId();
  const userB = new mongoose.Types.ObjectId();
  const coupons = [userA, userB].map((userId, index) => ({
    _id: new mongoose.Types.ObjectId(), userId, code: 'WELCOME5',
    isUsed: index === 0, discountValue: 5,
    expiresAt: new Date(Date.now() + 86400000),
  }));
  t.mock.method(Coupon, 'findOne', async (query) => coupons.find((coupon) =>
    coupon.code === query.code && (!query.userId || String(coupon.userId) === String(query.userId))
  ) || null);
  const result = await validateCoupon({ code: ' welcome5 ', userId: userB, subtotal: 1000 });
  assert.equal(String(result.couponId), String(coupons[1]._id));
  assert.equal(result.discountAmount, 50);
  await assert.rejects(validateCoupon({ code: 'WELCOME5', userId: userA, subtotal: 1000 }), /ถูกใช้งานไปแล้ว/);
  await assert.rejects(validateCoupon({ code: 'WELCOME5', userId: new mongoose.Types.ObjectId(), subtotal: 1000 }), /ไม่มีสิทธิ์/);
});

test('two concurrent createOrder calls persist only one discounted order and reserve stock once', async (t) => {
  const user = { _id: new mongoose.Types.ObjectId(), email: 'test@example.com' };
  const productId = new mongoose.Types.ObjectId();
  const variantId = new mongoose.Types.ObjectId();
  const coupon = { _id: new mongoose.Types.ObjectId(), code: 'WELCOME5', userId: user._id,
    isUsed: false, discountValue: 5, expiresAt: new Date(Date.now() + 86400000) };
  const orders = [];
  let arrivals = 0;
  let release;
  const bothArrived = new Promise((resolve) => { release = resolve; });
  t.mock.method(Product, 'findOne', async () => ({ _id: productId, title: 'Shirt',
    variants: [{ _id: variantId, sku: 'TEST', price: 1000, stock_quantity: 10 }] }));
  const stockUpdate = t.mock.method(Product, 'updateOne', async () => ({ modifiedCount: 1 }));
  t.mock.method(Coupon, 'findOneAndUpdate', async (filter, update, options) => {
    assert.equal(filter.code, coupon.code);
    assert.equal(String(filter.userId), String(user._id));
    assert.equal(filter.isUsed, false);
    assert.ok(filter.expiresAt.$gt instanceof Date);
    assert.equal(update.$set.isUsed, true);
    assert.ok(update.$set.usedAt instanceof Date);
    assert.equal(options.new, true);
    if (++arrivals === 2) release();
    await bothArrived;
    if (coupon.isUsed || coupon.expiresAt <= filter.expiresAt.$gt) return null;
    Object.assign(coupon, update.$set);
    return { ...coupon };
  });
  t.mock.method(Order, 'create', async (data) => {
    const order = { ...data };
    orders.push(order);
    return order;
  });
  t.mock.method(Order, 'findById', (id) => ({ populate: async () => orders.find((order) => String(order._id) === String(id)) }));
  const data = { couponCode: 'WELCOME5', items: [{ productId, variantId, sku: 'TEST', quantity: 1 }],
    shippingAddress: { firstName: 'Test', lastName: 'User', phone: '0800000000', address: 'Street', city: 'Bangkok', zipCode: '10100' } };
  const results = await Promise.allSettled([createOrder(user, data), createOrder(user, data)]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  const rejected = results.filter((result) => result.status === 'rejected');
  assert.equal(rejected.length, 1);
  assert.match(rejected[0].reason.message, /คูปองไม่ถูกต้อง หรือถูกใช้งานไปแล้ว/);
  assert.equal(orders.length, 1);
  assert.equal(orders[0].discountAmount, 50);
  assert.equal(stockUpdate.mock.callCount(), 1);
  assert.equal(coupon.isUsed, true);
  assert.equal(String(coupon.orderId), String(orders[0]._id));
});

test('an old order cannot release a coupon claimed by a newer checkout', async (t) => {
  const userId = new mongoose.Types.ObjectId();
  const oldOrderId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  const coupon = { code: 'WELCOME5', userId, orderId, isUsed: true };
  t.mock.method(Coupon, 'findOneAndUpdate', async (filter, update) => {
    if (!Object.entries(filter).every(([key, value]) => String(coupon[key]) === String(value))) return null;
    return Object.assign(coupon, update);
  });
  assert.equal(await refundCouponUsage({ code: 'WELCOME5', userId, orderId: oldOrderId }), null);
  assert.equal(coupon.isUsed, true);
  assert.equal(await refundCouponUsage({ code: 'WELCOME5', userId }), null);
  await refundCouponUsage({ code: ' welcome5 ', userId, orderId });
  assert.equal(coupon.isUsed, false);
  assert.equal(coupon.orderId, null);
});

for (const failure of ['stock', 'order']) {
  test(`failed ${failure} creation releases the coupon owned by that checkout`, async (t) => {
    const user = { _id: new mongoose.Types.ObjectId(), email: 'test@example.com' };
    const productId = new mongoose.Types.ObjectId();
    const variantId = new mongoose.Types.ObjectId();
    const coupon = { code: 'WELCOME5', userId: user._id, isUsed: false, discountValue: 5 };
    t.mock.method(Product, 'findOne', async () => ({ _id: productId, title: 'Shirt',
      variants: [{ _id: variantId, sku: 'TEST', price: 1000, stock_quantity: 10 }] }));
    const stock = t.mock.method(Product, 'updateOne', async () => ({ modifiedCount: failure === 'stock' ? 0 : 1 }));
    const creates = t.mock.method(Order, 'create', async () => { throw new Error('Order persistence failed'); });
    t.mock.method(Coupon, 'findOneAndUpdate', async (filter, update) => {
      if (filter.isUsed === false) {
        assert.ok(update.$set.orderId);
        Object.assign(coupon, update.$set);
        return { ...coupon };
      }
      assert.equal(String(filter.orderId), String(coupon.orderId));
      assert.equal(String(filter.userId), String(user._id));
      assert.equal(filter.isUsed, true);
      return Object.assign(coupon, update);
    });
    const data = { couponCode: 'WELCOME5', items: [{ productId, variantId, sku: 'TEST', quantity: 1 }],
      shippingAddress: { firstName: 'Test', lastName: 'User', phone: '0800000000', address: 'Street', city: 'Bangkok', zipCode: '10100' } };
    await assert.rejects(createOrder(user, data), failure === 'stock' ? /สต็อก/ : /Order persistence failed/);
    assert.equal(coupon.isUsed, false);
    assert.equal(coupon.orderId, null);
    assert.equal(creates.mock.callCount(), failure === 'stock' ? 0 : 1);
    assert.equal(stock.mock.callCount(), failure === 'stock' ? 1 : 2);
  });
}

test('validateCoupon queries with both code and userId to isolate user accounts', async (t) => {
  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();
  let capturedQuery = null;

  t.mock.method(Coupon, 'findOne', async (query) => {
    capturedQuery = query;
    return {
      _id: new mongoose.Types.ObjectId(),
      code: query.code,
      userId: query.userId,
      discountValue: 5,
      isUsed: false,
      expiresAt: new Date(Date.now() + 86400000),
    };
  });

  // User A validates WELCOME5
  const resultA = await validateCoupon({
    code: 'WELCOME5',
    userId: userAId,
    subtotal: 1000,
  });

  assert.equal(capturedQuery.code, 'WELCOME5');
  assert.equal(String(capturedQuery.userId), String(userAId));
  assert.equal(resultA.valid, true);
  assert.equal(resultA.discountAmount, 50);

  // User B validates WELCOME5
  const resultB = await validateCoupon({
    code: 'welcome5',
    userId: userBId,
    subtotal: 2000,
  });

  assert.equal(capturedQuery.code, 'WELCOME5');
  assert.equal(String(capturedQuery.userId), String(userBId));
  assert.equal(resultB.valid, true);
  assert.equal(resultB.discountAmount, 100);
});

test('validateCoupon rejects if userId is missing', async () => {
  await assert.rejects(
    async () => {
      await validateCoupon({
        code: 'WELCOME5',
        subtotal: 1000,
      });
    },
    /กรุณาเข้าสู่ระบบ/
  );
});

test('validateCoupon rejects if coupon not found for this user', async (t) => {
  const userCId = new mongoose.Types.ObjectId();
  t.mock.method(Coupon, 'findOne', async () => null);

  await assert.rejects(
    async () => {
      await validateCoupon({
        code: 'WELCOME5',
        userId: userCId,
        subtotal: 1000,
      });
    },
    /ไม่พบโค้ดส่วนลดนี้ในระบบ หรือคุณไม่มีสิทธิ์ใช้งาน/
  );
});

test('validateCoupon rejects already used coupon', async (t) => {
  const userId = new mongoose.Types.ObjectId();
  t.mock.method(Coupon, 'findOne', async () => ({
    _id: new mongoose.Types.ObjectId(),
    code: 'WELCOME5',
    userId,
    isUsed: true,
    expiresAt: new Date(Date.now() + 86400000),
  }));

  await assert.rejects(
    async () => {
      await validateCoupon({
        code: 'WELCOME5',
        userId,
        subtotal: 1000,
      });
    },
    /คูปองนี้ถูกใช้งานไปแล้ว/
  );
});

test('claimCouponAtomically only allows one claim when concurrent checkouts hit (race condition prevention)', async (t) => {
  const userId = new mongoose.Types.ObjectId();
  let callCount = 0;

  // Simulate atomic findOneAndUpdate in MongoDB:
  // First call finds the document with isUsed: false, sets isUsed: true and returns it.
  // Second concurrent call matches 0 documents (because isUsed is now true) and returns null.
  t.mock.method(Coupon, 'findOneAndUpdate', async (filter, update) => {
    callCount += 1;
    assert.equal(filter.code, 'WELCOME5');
    assert.equal(String(filter.userId), String(userId));
    assert.equal(filter.isUsed, false);

    if (callCount === 1) {
      return {
        _id: new mongoose.Types.ObjectId(),
        code: filter.code,
        userId: filter.userId,
        isUsed: true,
        usedAt: new Date(),
        discountValue: 5,
      };
    }
    // Concurrent second request cannot find isUsed: false
    return null;
  });

  const [claim1, claim2] = await Promise.all([
    claimCouponAtomically({ code: 'WELCOME5', userId }),
    claimCouponAtomically({ code: 'WELCOME5', userId }),
  ]);

  // Exactly one checkout must succeed and the other must be rejected
  const successes = [claim1, claim2].filter((res) => res !== null);
  const failures = [claim1, claim2].filter((res) => res === null);

  assert.equal(successes.length, 1, 'Only one concurrent checkout can claim the coupon');
  assert.equal(failures.length, 1, 'The other concurrent checkout must receive null');
  assert.equal(successes[0].isUsed, true);
});
