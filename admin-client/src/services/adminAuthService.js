const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
const USER_KEY = 'occasion_admin_user';

async function request(path, options = {}) {
  try {
    const response = await fetch(API_BASE_URL + path, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
    return result;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('เชื่อมต่อ Server ไม่ได้ กรุณาตรวจสอบว่า Server เปิดอยู่');
    }
    throw error;
  }
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
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    return response.data.user;
  },

  async verify() {
    const response = await request('/admin/auth/me');
    if (response.data?.role !== 'admin') {
      throw new Error('บัญชีนี้ไม่มีสิทธิ์ Admin');
    }
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  },

  async logout() {
    try {
      await request('/admin/auth/logout', { method: 'POST' });
    } catch {
      // Local session data must still be cleared when the server is unavailable.
    } finally {
      localStorage.removeItem('occasion_admin_token');
      localStorage.removeItem(USER_KEY);
    }
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  }
};
