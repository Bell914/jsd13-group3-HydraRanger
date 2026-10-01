import { defineConfig, devices } from '@playwright/test';

const sharedEnv = {
  ...process.env,
  NODE_ENV: 'test',
  PORT: '5001',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/occasion_e2e',
  JWT_SECRET: process.env.JWT_SECRET || 'e2e-only-secret-change-me',
  CLIENT_URL: 'http://127.0.0.1:5173',
  ADMIN_CLIENT_URL: 'http://127.0.0.1:5174'
};

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm start --prefix server',
      url: 'http://127.0.0.1:5001/api/health',
      env: sharedEnv,
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'npm run dev --prefix client -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5173',
      env: { ...process.env, VITE_API_BASE_URL: 'http://127.0.0.1:5001/api' },
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'npm run dev --prefix admin-client -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5174',
      env: { ...process.env, VITE_API_BASE_URL: 'http://127.0.0.1:5001/api' },
      reuseExistingServer: !process.env.CI
    }
  ]
});
