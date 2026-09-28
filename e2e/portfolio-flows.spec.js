import { test, expect } from '@playwright/test';

const API = 'http://127.0.0.1:5001/api';
const CUSTOMER_EMAIL = 'developer@occasion.dev';
const CUSTOMER_PASSWORD = process.env.SEED_USER_PASSWORD || 'e2e-user-password';
const ADMIN_EMAIL = 'admin@occasion.dev';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'e2e-admin-password';

async function apiLogin(request, path, email, password) {
  const response = await request.post(`${API}${path}`, { data: { email, password } });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).data;
}

async function customerLogin(request) {
  return apiLogin(request, '/auth/login', CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
}

async function loginCustomerInBrowser(page, email = CUSTOMER_EMAIL, password = CUSTOMER_PASSWORD) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

test('customer profile loads coupons whose eligibility comes from the backend', async ({ page, request }) => {
  const email = `portfolio-${Date.now()}@example.com`;
  const password = 'Portfolio123!';
  const registerResponse = await request.post(`${API}/auth/register`, {
    data: { username: `portfolio${Date.now()}`, email, password }
  });
  expect(registerResponse.ok()).toBeTruthy();
  const session = (await registerResponse.json()).data;
  await request.put(`${API}/auth/profile`, {
    headers: { Authorization: `Bearer ${session.token}` },
    data: { birthMonth: new Date().getUTCMonth() + 1 }
  });

  await loginCustomerInBrowser(page, email, password);
  await page.goto('/profile?tab=coupons');
  await page.getByRole('button', { name: /คูปองและรางวัล/ }).click();

  await expect(page.getByText('OCCWELCOME10')).toBeVisible();
  await expect(page.getByText('BDAY5')).toBeVisible();
  await expect(page.getByText(/กำลังโหลดสิทธิ์จากระบบ/)).toBeHidden();

  const productsResponse = await request.get(`${API}/products`);
  const product = (await productsResponse.json()).data[0];
  const variant = product.variants[0];
  const couponOrder = {
    email,
    items: [{ productId: product._id, variantId: variant._id, sku: variant.sku, quantity: 2 }],
    shippingAddress: {
      firstName: 'Coupon', lastName: 'Tester', phone: '0812345678',
      address: '1 Test Road', city: 'Bangkok', zipCode: '10110'
    },
    shippingMethod: 'standard', paymentMethod: 'credit-card', couponCode: 'OCCWELCOME10'
  };
  const orderResponse = await request.post(`${API}/orders`, {
    headers: { Authorization: `Bearer ${session.token}` },
    data: couponOrder
  });
  expect(orderResponse.ok()).toBeTruthy();
  expect((await orderResponse.json()).data.discountAmount).toBeGreaterThan(0);

  const duplicateResponse = await request.post(`${API}/orders`, {
    headers: { Authorization: `Bearer ${session.token}` },
    data: couponOrder
  });
  expect(duplicateResponse.status()).toBe(400);
  expect((await duplicateResponse.json()).message).toContain('already been used');

  await page.reload();
  await expect(page.getByText('ใช้สิทธิ์นี้แล้ว')).toBeVisible();
});

test('customer can save a consented size profile end to end', async ({ page }) => {
  await loginCustomerInBrowser(page);
  await page.goto('/profile?tab=size-profile');
  await page.getByRole('button', { name: /Size & Fit/ }).click();
  await page.getByRole('button', { name: 'ซม.' }).click();
  await page.getByLabel(/รอบอก/).fill('92');
  await page.getByLabel(/รอบเอว/).fill('78');
  await page.getByLabel(/รอบสะโพก/).fill('96');
  await page.getByLabel(/ชอบเสื้อผ้าทรงไหน/).selectOption('regular');
  await page.getByLabel(/ฉันยินยอม/).check();
  await page.getByRole('button', { name: 'บันทึกข้อมูลไซส์' }).click();

  await expect(page.getByText('บันทึกข้อมูลสำหรับแนะนำไซส์เรียบร้อยแล้ว')).toBeVisible();
});

test('admin can move a real customer order through the authorized workflow', async ({ page, request }) => {
  const customer = await customerLogin(request);
  const productsResponse = await request.get(`${API}/products`);
  const products = (await productsResponse.json()).data;
  const product = products[0];
  const variant = product.variants[0];
  const orderResponse = await request.post(`${API}/orders`, {
    headers: { Authorization: `Bearer ${customer.token}` },
    data: {
      email: CUSTOMER_EMAIL,
      items: [{ productId: product._id, variantId: variant._id, sku: variant.sku, quantity: 1 }],
      shippingAddress: {
        firstName: 'Portfolio', lastName: 'Tester', phone: '0812345678',
        address: '1 Test Road', city: 'Bangkok', zipCode: '10110'
      },
      shippingMethod: 'standard',
      paymentMethod: 'credit-card'
    }
  });
  expect(orderResponse.ok()).toBeTruthy();
  const order = (await orderResponse.json()).data;

  await page.goto('http://127.0.0.1:5174/login');
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ Admin' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('http://127.0.0.1:5174/orders');
  await page.getByPlaceholder('ค้นหา Order หรือลูกค้า...').fill(order.orderNumber);
  const row = page.getByRole('row').filter({ hasText: order.orderNumber });
  await row.locator('select').selectOption('paid');

  await expect(row.locator('select')).toHaveValue('paid');
});

test('admin product CRUD persists through the API and survives refresh', async ({ page, request }) => {
  const admin = await apiLogin(request, '/admin/auth/login', ADMIN_EMAIL, ADMIN_PASSWORD);
  const productName = `Portfolio Demo ${Date.now()}`;
  const updatedName = `${productName} Updated`;

  await page.goto('http://127.0.0.1:5174/login');
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ Admin' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('http://127.0.0.1:5174/products');
  await page.getByRole('button', { name: /เพิ่มสินค้าใหม่/ }).click();
  let dialog = page.getByRole('dialog');

  await dialog.getByRole('button', { name: 'บันทึกสินค้า' }).click();
  await expect(page.getByText('กรุณากรอกชื่อสินค้า')).toBeVisible();
  await expect(page.getByText('กรุณากรอกรายละเอียดสินค้า')).toBeVisible();
  await expect(page.getByText('ราคาต้องมากกว่า 0')).toBeVisible();

  await dialog.getByLabel(/ชื่อสินค้า/).fill(productName);
  await dialog.getByLabel(/รายละเอียดสินค้า/).fill('Created by the Sprint 3 end-to-end portfolio test');
  await dialog.getByLabel(/Tags/).fill('portfolio, sprint-3');
  await dialog.getByLabel(/วันที่เริ่มจำหน่าย/).fill('2026-09-28');
  await dialog.getByLabel(/รอบอกเสื้อจริง/).fill('98');
  await dialog.getByLabel(/SKU/).fill(`PORT-${Date.now()}`);
  await dialog.getByLabel(/สี \*/).fill('Black');
  await dialog.getByLabel(/ราคา/).fill('690');
  await dialog.getByLabel(/Stock/).fill('7');
  await dialog.getByRole('button', { name: 'บันทึกสินค้า' }).click();

  await expect(page.getByText(productName, { exact: true })).toBeVisible();
  let persisted = await request.get(`${API}/admin/products`, {
    headers: { Authorization: `Bearer ${admin.token}` }
  });
  let storedProduct = (await persisted.json()).data.find((product) => product.title === productName);
  expect(storedProduct).toBeTruthy();
  expect(storedProduct.variants[0].stock_quantity).toBe(7);

  await page.getByRole('button', { name: `แก้ไข ${productName}` }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel(/ชื่อสินค้า/).fill(updatedName);
  await dialog.getByRole('button', { name: 'บันทึกการแก้ไข' }).click();
  await page.reload();
  await expect(page.getByText(updatedName, { exact: true })).toBeVisible();

  persisted = await request.get(`${API}/admin/products`, {
    headers: { Authorization: `Bearer ${admin.token}` }
  });
  storedProduct = (await persisted.json()).data.find((product) => product._id === storedProduct._id);
  expect(storedProduct.title).toBe(updatedName);

  await page.getByRole('button', { name: `ลบ ${updatedName}` }).click();
  await page.getByRole('button', { name: 'ลบสินค้า' }).click();
  await expect(page.getByText(updatedName, { exact: true })).toBeHidden();
  persisted = await request.get(`${API}/admin/products`, {
    headers: { Authorization: `Bearer ${admin.token}` }
  });
  expect((await persisted.json()).data.some((product) => product._id === storedProduct._id)).toBe(false);
});

test('API returns safe errors for missing auth, malformed IDs, and insufficient stock', async ({ request }) => {
  const unauthenticated = await request.get(`${API}/admin/products`);
  expect(unauthenticated.status()).toBe(401);

  const missingProduct = await request.get(`${API}/products/not-a-valid-id`);
  expect(missingProduct.status()).toBe(404);

  const customer = await customerLogin(request);
  const productsResponse = await request.get(`${API}/products`);
  const product = (await productsResponse.json()).data[0];
  const variant = product.variants[0];
  const response = await request.post(`${API}/orders`, {
    headers: { Authorization: `Bearer ${customer.token}` },
    data: {
      email: CUSTOMER_EMAIL,
      items: [{
        productId: product._id, variantId: variant._id, sku: variant.sku,
        quantity: variant.stock_quantity + 1
      }],
      shippingAddress: {
        firstName: 'Error', lastName: 'Tester', phone: '0812345678',
        address: '1 Test Road', city: 'Bangkok', zipCode: '10110'
      },
      shippingMethod: 'standard', paymentMethod: 'credit-card'
    }
  });
  expect(response.status()).toBe(400);
  expect((await response.json()).message).toContain('Not enough stock');
});
