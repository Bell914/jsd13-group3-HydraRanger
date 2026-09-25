import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import express from 'express';
import mongoose from 'mongoose';
import { once } from 'node:events';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimiterMiddleware.js';
import { memoryUpload, MAX_RECOMMEND_IMAGE_SIZE } from '../middleware/recommendUploadMiddleware.js';
import { getProducts, updateProduct } from '../services/productService.js';
import { canTransitionOrderStatus, cancelOrder, getExpiredPendingPaymentOrders, updateOrderStatus} from '../services/orderService.js';
import { resetPassword } from '../services/authService.js';
import { matchesUploadedImageHeader } from '../middleware/uploadMiddleware.js';
import recommendRoutes from '../routes/recommendRoutes.js';

function response() {
  return {
    statusCode: 200,
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; }
  };
}

test('login requests do not consume the registration limit', () => {
  const login = rateLimit({ max: 1 });
  const register = rateLimit({ max: 1 });
  const req = { ip: 'same-customer' };
  login(req, response(), () => {});
  const blocked = response();
  login(req, blocked, () => {});
  assert.equal(blocked.statusCode, 429);
  let allowed = false;
  register(req, response(), () => { allowed = true; });
  assert.equal(allowed, true);
});

test('rate limits reset after their own time window', (t) => {
  let now = 1000;
  t.mock.method(Date, 'now', () => now);
  const limiter = rateLimit({ max: 1, windowMs: 1000 });
  const req = { ip: 'customer' };
  limiter(req, response(), () => {});
  now = 2001;
  let allowed = false;
  limiter(req, response(), () => { allowed = true; });
  assert.equal(allowed, true);
});

test('production rejects unverifiable and suspended sessions', async (t) => {
  const previousEnv = ENV.NODE_ENV;
  ENV.NODE_ENV = 'production';
  t.after(() => { ENV.NODE_ENV = previousEnv; });
  const token = jwt.sign({ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', role: 'admin' }, ENV.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const dbError = new Error('Database unavailable');
  dbError.name = 'MongoNetworkError';
  t.mock.method(User, 'findById', () => ({ select: async () => { throw dbError; } }));
  const unavailable = response();
  await protect(req, unavailable, () => assert.fail('Must not authorize while DB is unavailable'));
  assert.equal(unavailable.statusCode, 503);

  User.findById.mock.mockImplementation(() => ({ select: async () => ({ isActive: false }) }));
  const suspended = response();
  await protect(req, suspended, () => assert.fail('Must not authorize suspended accounts'));
  assert.equal(suspended.statusCode, 403);

  User.findById.mock.mockImplementation(() => ({ select: async () => ({ role: 'user', isActive: true }) }));
  let allowed = false;
  await protect(req, response(), () => { allowed = true; });
  assert.equal(allowed, true);
  assert.equal(req.user.role, 'user');

  const mockToken = jwt.sign({ id: 'env-admin', role: 'admin' }, ENV.JWT_SECRET);
  const synthetic = response();
  await protect({ headers: { authorization: `Bearer ${mockToken}` } }, synthetic, () => assert.fail('No production mock sessions'));
  assert.equal(synthetic.statusCode, 401);
});

test('editing a product preserves an omitted size chart and accepts explicit changes', async (t) => {
  const originalChart = [{ size_name: 'M', garment_chest_actual: 102 }];
  const stored = { size_chart: originalChart };
  t.mock.method(Product, 'findByIdAndUpdate', (id, data) => ({
    populate: async () => Object.assign(stored, data)
  }));
  const product = {
    category_id: 'aaaaaaaaaaaaaaaaaaaaaaaa', title: 'Updated name',
    variants: [{ sku: 'TOP-M', size: 'M', price: 500, stock_quantity: 5 }]
  };
  await updateProduct('bbbbbbbbbbbbbbbbbbbbbbbb', product);
  assert.deepEqual(stored.size_chart, originalChart);
  const changedChart = [{ size_name: 'M', garment_chest_actual: 104 }];
  await updateProduct('bbbbbbbbbbbbbbbbbbbbbbbb', { ...product, size_chart: changedChart });
  assert.deepEqual(stored.size_chart, changedChart);
  await updateProduct('bbbbbbbbbbbbbbbbbbbbbbbb', { ...product, size_chart: [] });
  assert.deepEqual(stored.size_chart, []);
});

test('admin product listing includes inactive products that can be reopened', async (t) => {
  const filters = [];
  t.mock.method(Product, 'find', (filter) => {
    filters.push(filter);
    return {
      populate() { return this; },
      async sort() { return []; }
    };
  });

  await getProducts();
  await getProducts({ includeInactive: true });

  assert.deepEqual(filters[0], { is_active: { $ne: false } });
  assert.deepEqual(filters[1], {});
});

test('order status follows the forward workflow and keeps terminal states closed', () => {
  assert.equal(canTransitionOrderStatus('pending', 'paid'), true);
  assert.equal(canTransitionOrderStatus('paid', 'processing'), true);
  assert.equal(canTransitionOrderStatus('completed', 'pending'), false);
  assert.equal(canTransitionOrderStatus('cancelled', 'paid'), false);
  assert.equal(canTransitionOrderStatus('completed', 'refunded'), true);
});

test('stock restoration runs inside the order status transaction', async (t) => {
  const events = [];
  const session = {
    startTransaction() { events.push('start'); },
    async commitTransaction() { events.push('commit'); },
    async abortTransaction() { events.push('abort'); },
    endSession() { events.push('end'); }
  };
  const order = {
    status: 'paid',
    stockReserved: true,
    stockRestored: false,
    loyaltyProcessed: false,
    subtotal: 500,
    discountAmount: 0,
    user: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    items: [{
      product: 'bbbbbbbbbbbbbbbbbbbbbbbb',
      variantId: 'cccccccccccccccccccccccc',
      quantity: 1
    }],
    async save(options) {
      assert.equal(options.session, session);
      events.push('save');
    },
    async populate() { return this; }
  };

  t.mock.method(mongoose, 'startSession', async () => session);
  t.mock.method(Order, 'findById', () => order);
  t.mock.method(Product, 'updateOne', async (_filter, _update, options) => {
    assert.equal(options.session, session);
    events.push('stock');
  });

  await updateOrderStatus('dddddddddddddddddddddddd', 'cancelled');

  assert.deepEqual(events, ['start', 'stock', 'save', 'commit', 'end']);
  assert.equal(order.stockRestored, true);
});

test('persistent image upload validates file signatures', () => {
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);
  assert.equal(matchesUploadedImageHeader({ mimetype: 'image/png', buffer: png }), true);
  assert.equal(matchesUploadedImageHeader({ mimetype: 'image/png', buffer: Buffer.from('not png') }), false);
});

test('expired pending payment lookup includes card and mock methods past their deadline', async (t) => {
  const now = new Date('2026-09-24T12:00:00.000Z');
  let filter;
  t.mock.method(Order, 'find', (query) => {
    filter = query;
    return [];
  });

  await getExpiredPendingPaymentOrders(now);

  assert.equal(filter.status, 'pending');
  assert.deepEqual(filter.paymentMethod, { $in: ['credit-card', 'promptpay', 'paypal'] });
  assert.equal(filter.$or[0].paymentExpiresAt.$lte, now);
  assert.equal(filter.$or[1].paymentMethod, 'credit-card');
  assert.equal(filter.$or[1].paymentExpiresAt, null);
  assert.equal(filter.$or[1].createdAt.$lte.toISOString(), '2026-09-24T11:30:00.000Z');
});

test('cancelling a pending order restores its reserved stock', async (t) => {
  const userId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
  const order = {
    _id: 'bbbbbbbbbbbbbbbbbbbbbbbb',
    user: userId,
    status: 'pending',
    stockReserved: true,
    stockRestored: false,
    loyaltyProcessed: false,
    subtotal: 200,
    discountAmount: 0,
    items: [{ product: 'cccccccccccccccccccccccc', variantId: 'dddddddddddddddddddddddd', quantity: 2 }],
    async save() {}
  };
  let stock = 3;
  let findByIdCalls = 0;

  t.mock.method(Order, 'findOne', () => ({ populate: async () => order }));
  t.mock.method(Order, 'findById', () => {
    findByIdCalls += 1;
    if (findByIdCalls === 1) return Promise.resolve(order);
    return { populate: async () => order };
  });
  t.mock.method(Product, 'updateOne', async (_filter, update) => {
    stock += update.$inc['variants.$.stock_quantity'];
    return { modifiedCount: 1 };
  });
  t.mock.method(mongoose, 'startSession', async () => ({
    startTransaction() {},
    async commitTransaction() {},
    async abortTransaction() {},
    endSession() {}
  }));

  const cancelledOrder = await cancelOrder(userId, order._id);

  assert.equal(cancelledOrder.status, 'cancelled');
  assert.equal(cancelledOrder.stockRestored, true);
  assert.equal(stock, 5);
});

test('password reset revokes existing sessions', async (t) => {
  const user = {
    password: 'old-password',
    tokenVersion: 2,
    resetPasswordToken: 'stored-token',
    resetPasswordExpires: new Date(Date.now() + 1000),
    async save() {}
  };
  t.mock.method(User, 'findOne', async () => user);

  await resetPassword({ token: 'valid-token', password: 'new-password' });
  assert.equal(user.tokenVersion, 3);
  assert.equal(user.resetPasswordToken, null);
});

test('recommend uploads reject oversized, unsupported and spoofed images before AI', async (t) => {
  const app = express();
  app.use('/recommend', recommendRoutes);
  app.post('/upload', memoryUpload, (req, res) => res.json({ files: Object.keys(req.files) }));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/upload`;
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN1sAAAAASUVORK5CYII=', 'base64');

  async function postImage(data, type) {
    const form = new FormData();
    form.append('top', new Blob([data], { type }), 'test.png');
    return fetch(url, { method: 'POST', body: form });
  }

  assert.equal((await postImage(png, 'image/png')).status, 200);
  assert.equal((await postImage('not an image', 'text/plain')).status, 400);
  assert.equal((await postImage('not an image', 'image/png')).status, 400);
  assert.equal((await postImage(Buffer.alloc(MAX_RECOMMEND_IMAGE_SIZE + 1), 'image/png')).status, 413);

  const pair = new FormData();
  pair.append('top', new Blob([png], { type: 'image/png' }), 'top.png');
  pair.append('bottom', new Blob([png], { type: 'image/png' }), 'bottom.png');
  const accepted = await fetch(url, { method: 'POST', body: pair });
  assert.equal(accepted.status, 200);
  assert.deepEqual((await accepted.json()).files, ['top', 'bottom']);

  pair.append('top', new Blob([png], { type: 'image/png' }), 'extra.png');
  assert.equal((await fetch(url, { method: 'POST', body: pair })).status, 400);

  // Empty requests stop before Gemini; the real route still counts them.
  const recommendUrl = url.replace('/upload', '/recommend');
  for (let count = 0; count < 10; count += 1) {
    const rejected = await fetch(recommendUrl, { method: 'POST' });
    assert.equal(rejected.status, 400);
  }
  const limited = await fetch(recommendUrl, { method: 'POST' });
  assert.equal(limited.status, 429);
});
