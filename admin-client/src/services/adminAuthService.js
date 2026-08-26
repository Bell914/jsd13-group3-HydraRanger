const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'occasion_admin_token';
const USER_KEY = 'occasion_admin_user';

const request = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(API_BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Unable to connect to the admin server');
  return payload;
};

export const adminAuthService = {
  async login(credentials) {
    const response = await request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (response.data?.user?.role !== 'admin') throw new Error('Admin access only');
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    return response.data.user;
  },

  async verify() {
    const response = await request('/admin/auth/me');
    if (response.data?.role !== 'admin') throw new Error('Admin access only');
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  }
};
