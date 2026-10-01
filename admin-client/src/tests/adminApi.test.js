import test from 'node:test';
import assert from 'node:assert/strict';
import { adminRequest, ADMIN_TOKEN_KEY, ADMIN_USER_KEY } from '../services/adminApi.js';
import { productService } from '../services/productService.js';
import { getOrders } from '../services/orderService.js';
import { getCustomers } from '../services/customerService.js';
import { getDashboardSummary } from '../services/dashboardService.js';
import { getLookbooks } from '../services/lookbookService.js';
import { getArticles } from '../services/articleService.js';
import { uploadProductImage } from '../services/uploadService.js';

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

function setBrowserGlobals() {
  globalThis.localStorage = new MemoryStorage();
  globalThis.sessionStorage = new MemoryStorage();
  globalThis.window = {
    location: {
      pathname: '/products',
      redirects: [],
      replace(path) {
        this.redirects.push(path);
      }
    }
  };
}

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return data;
    }
  };
}

test('every Admin data service sends the session bearer token', async () => {
  setBrowserGlobals();
  sessionStorage.setItem(ADMIN_TOKEN_KEY, 'admin-token');
  const requests = [];

  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith('/admin/products')) return jsonResponse({ data: [] });
    if (url.endsWith('/uploads')) return jsonResponse({ data: { url: '/image.jpg' } });
    return jsonResponse({ data: [] });
  };

  await productService.getProducts();
  await getOrders();
  await getCustomers();
  await getDashboardSummary();
  await getLookbooks();
  await getArticles();
  await uploadProductImage(new Blob(['image'], { type: 'image/png' }));

  assert.equal(requests.length, 7);
  for (const request of requests) {
    assert.equal(request.options.credentials, 'include');
    assert.equal(request.options.headers.Authorization, 'Bearer admin-token');
  }
  assert.equal(requests.at(-1).options.headers['Content-Type'], undefined);
});

test('adminRequest clears an expired session and returns to login on 401', async () => {
  setBrowserGlobals();
  localStorage.setItem(ADMIN_USER_KEY, '{"role":"admin"}');
  sessionStorage.setItem(ADMIN_TOKEN_KEY, 'expired-token');
  globalThis.fetch = async () => jsonResponse({ message: 'Session expired' }, 401);

  await assert.rejects(() => adminRequest('/admin/dashboard'), /Session expired/);

  assert.equal(localStorage.getItem(ADMIN_USER_KEY), null);
  assert.equal(sessionStorage.getItem(ADMIN_TOKEN_KEY), null);
  assert.deepEqual(window.location.redirects, ['/login']);
});

test('adminRequest keeps caller headers while adding JSON and authorization headers', async () => {
  setBrowserGlobals();
  sessionStorage.setItem(ADMIN_TOKEN_KEY, 'admin-token');
  let sentOptions;
  globalThis.fetch = async (_url, options) => {
    sentOptions = options;
    return jsonResponse({ data: {} });
  };

  await adminRequest('/admin/products/1', {
    method: 'PATCH',
    headers: { 'X-Request-ID': 'request-1' },
    body: JSON.stringify({ is_active: false })
  });

  assert.deepEqual(sentOptions.headers, {
    'Content-Type': 'application/json',
    Authorization: 'Bearer admin-token',
    'X-Request-ID': 'request-1'
  });
});
