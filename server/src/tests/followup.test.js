import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import express from 'express';
import { once } from 'node:events';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimiterMiddleware.js';
import { memoryUpload, MAX_RECOMMEND_IMAGE_SIZE } from '../middleware/recommendUploadMiddleware.js';
import { updateProduct } from '../services/productService.js';
import { canTransitionOrderStatus } from '../services/orderService.js';
import { createReview } from '../services/reviewService.js';
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

test('order status follows the forward workflow and keeps terminal states closed', () => {
  assert.equal(canTransitionOrderStatus('pending', 'paid'), true);
  assert.equal(canTransitionOrderStatus('paid', 'processing'), true);
  assert.equal(canTransitionOrderStatus('completed', 'pending'), false);
  assert.equal(canTransitionOrderStatus('cancelled', 'paid'), false);
  assert.equal(canTransitionOrderStatus('completed', 'refunded'), true);
});

test('persistent image upload validates file signatures', () => {
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);
  assert.equal(matchesUploadedImageHeader({ mimetype: 'image/png', buffer: png }), true);
  assert.equal(matchesUploadedImageHeader({ mimetype: 'image/png', buffer: Buffer.from('not png') }), false);
});

test('reviews require a completed order', async (t) => {
  let orderFilter;
  t.mock.method(Order, 'findOne', async (filter) => {
    orderFilter = filter;
    return null;
  });

  await assert.rejects(
    createReview('aaaaaaaaaaaaaaaaaaaaaaaa', {
      orderId: 'bbbbbbbbbbbbbbbbbbbbbbbb',
      productId: 'cccccccccccccccccccccccc',
      rating: 5,
      comment: 'great product'
    }),
    /สามารถรีวิวได้เฉพาะสินค้าที่จัดส่งเสร็จสิ้น \(completed\) แล้วเท่านั้น/
  );
  assert.equal(orderFilter.status, 'completed');
  assert.equal(String(orderFilter.user), 'aaaaaaaaaaaaaaaaaaaaaaaa');
  assert.equal(String(orderFilter['items.product']), 'cccccccccccccccccccccccc');
});

test('duplicate review constraint is unique per user, product, and order', async (t) => {
  const indexes = Review.schema.indexes();
  assert.ok(indexes.some(([keys, options]) => keys.user === 1 && keys.product === 1 && keys.order === 1 && options.unique));
  t.mock.method(Order, 'findOne', async () => ({ _id: 'bbbbbbbbbbbbbbbbbbbbbbbb' }));
  t.mock.method(Product, 'findById', async () => ({ _id: 'cccccccccccccccccccccccc' }));
  t.mock.method(Review, 'create', async () => { const error = new Error('duplicate'); error.code = 11000; throw error; });
  await assert.rejects(createReview('aaaaaaaaaaaaaaaaaaaaaaaa', {
    orderId: 'bbbbbbbbbbbbbbbbbbbbbbbb', productId: 'cccccccccccccccccccccccc', rating: 5, comment: 'great product'
  }), (error) => error.code === 11000);
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
