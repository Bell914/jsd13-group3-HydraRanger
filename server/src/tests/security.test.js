import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAllowedOrigins, isOriginAllowed } from '../config/security.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimiterMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';
import { validateLoginInput } from '../validators/authValidator.js';
import { generateToken } from '../services/authService.js';
import { errorHandler } from '../middleware/errorMiddleware.js';
import { getDBStatus } from '../config/db.js';

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test('health database status does not expose the connection URI', () => {
  const status = getDBStatus();

  assert.equal(Object.hasOwn(status, 'uri'), false);
  assert.equal(typeof status.isConnected, 'boolean');
  assert.equal(typeof status.readyState, 'number');
});

test('CORS accepts configured websites and rejects lookalike domains', () => {
  const allowedOrigins = buildAllowedOrigins({
    NODE_ENV: 'production',
    CLIENT_URL: 'https://shop.example.com/',
    ADMIN_CLIENT_URL: 'https://admin.example.com'
  });

  assert.equal(isOriginAllowed('https://shop.example.com', allowedOrigins), true);
  assert.equal(isOriginAllowed('https://admin.example.com/', allowedOrigins), true);
  assert.equal(isOriginAllowed('https://shop.example.com.attacker.test', allowedOrigins), false);
});

test('protected API rejects a request without a JWT token', async () => {
  const response = createResponse();
  let nextCalled = false;

  await protect({ headers: {} }, response, () => {
    nextCalled = true;
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.success, false);
  assert.equal(nextCalled, false);
});

test('protected API also reads a JWT from the HttpOnly session cookie', async () => {
  const response = createResponse();
  const token = generateToken({
    id: 'mock-user-security-test', email: 'test@example.com', role: 'user', tokenVersion: 0
  });
  await protect(
    { cookies: { occasion_session: token }, originalUrl: '/api/auth/me' },
    response,
    () => {}
  );
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, 'Development sessions are not allowed');
});

test('production rejects development-only synthetic sessions', async () => {
  const response = createResponse();
  let nextCalled = false;
  const token = generateToken({
    id: 'mock-user-security-test',
    email: 'test@example.com',
    role: 'user',
    tokenVersion: 0
  });

  await protect(
    { headers: { authorization: `Bearer ${token}` } },
    response,
    () => { nextCalled = true; }
  );

  assert.equal(response.statusCode, 401);
  assert.equal(nextCalled, false);
});

test('admin authorization rejects a customer role', () => {
  const response = createResponse();
  let nextCalled = false;

  authorize('admin')(
    { user: { role: 'user' } },
    response,
    () => { nextCalled = true; }
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.success, false);
  assert.equal(nextCalled, false);
});

test('login validation rejects malformed input', () => {
  const response = createResponse();
  let nextCalled = false;

  validate(validateLoginInput)(
    { body: { email: 'not-an-email', password: '' } },
    response,
    () => { nextCalled = true; }
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Validation failed');
  assert.equal(nextCalled, false);
});

test('rate limiter blocks requests after the configured limit', () => {
  const limiter = rateLimit({ windowMs: 1000, max: 1 });
  const request = { ip: 'security-test-client' };
  const firstResponse = createResponse();
  const secondResponse = createResponse();
  let firstNextCalled = false;

  limiter(request, firstResponse, () => { firstNextCalled = true; });
  limiter(request, secondResponse, () => {});

  assert.equal(firstNextCalled, true);
  assert.equal(secondResponse.statusCode, 429);
  assert.equal(secondResponse.body.success, false);
});

test('production error responses do not expose internal server details', () => {
  const response = createResponse();
  errorHandler(
    new Error('MongoServerError: private database detail'),
    { method: 'GET', url: '/api/private' },
    response,
    () => {}
  );

  assert.equal(response.statusCode, 500);
  assert.equal(response.body.message, 'Internal Server Error');
  assert.equal(response.body.errors, null);
});
