import { api } from './api.js';

export const authService = {
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    if (res.data?.token) {
      api.setToken(res.data.token);
      localStorage.setItem('hydra_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.token) {
      api.setToken(res.data.token);
      localStorage.setItem('hydra_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async getMe() {
    return await api.get('/auth/me');
  },

  logout() {
    api.setToken(null);
    localStorage.removeItem('hydra_user');
  },

  getCurrentUser() {
    const saved = localStorage.getItem('hydra_user');
    return saved ? JSON.parse(saved) : null;
  },

  isAuthenticated() {
    return Boolean(api.getToken());
  }
};
