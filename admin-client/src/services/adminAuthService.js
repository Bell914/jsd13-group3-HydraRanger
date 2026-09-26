import {
  ADMIN_TOKEN_KEY,
  ADMIN_USER_KEY,
  adminRequest,
  clearAdminSession
} from './adminApi.js';

function request(path, options = {}) {
  return adminRequest(path, {
    ...options,
    errorMessage: 'เข้าสู่ระบบไม่สำเร็จ',
    redirectOnUnauthorized: false
  });
}

export const adminAuthService = {
  async login(credentials) {
    const response = await request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (response.data?.user?.role !== 'admin') {
      throw new Error('บัญชีนี้ไม่มีสิทธิ์ Admin');
    }
    if (response.data?.token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, response.data.token);
    }
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(response.data.user));
    return response.data.user;
  },

  async verify() {
    const response = await request('/admin/auth/me');
    if (response.data?.role !== 'admin') {
      throw new Error('บัญชีนี้ไม่มีสิทธิ์ Admin');
    }
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(response.data));
    return response.data;
  },

  async logout() {
    try {
      await request('/admin/auth/logout', { method: 'POST' });
    } catch {
      // Local session data must still be cleared when the server is unavailable.
    } finally {
      clearAdminSession();
    }
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_USER_KEY));
    } catch {
      return null;
    }
  }
};
