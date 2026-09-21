import { api } from "./api.js";

export const authService = {
  async register(userData) {
    const res = await api.post("/auth/register", userData);
    if (res.data?.token) {
      api.setToken(res.data.token);
      localStorage.setItem("occasion_user", JSON.stringify(res.data.user));
    }
    return res;
  },

  async login(credentials) {
    const res = await api.post("/auth/login", credentials);
    if (res.data?.token) {
      api.setToken(res.data.token);
      localStorage.setItem("occasion_user", JSON.stringify(res.data.user));
    }
    return res;
  },

  async getMe() {
    return await api.get("/auth/me");
  },

  async updateProfile(userData) {
    return await api.put("/auth/profile", userData);
  },

  async changePassword({ currentPassword, newPassword }) {
    return await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  async refresh() {
    const token = api.getToken();
    if (!token) return null;
    const res = await api.post("/auth/refresh", { token });
    return res?.data?.token || null;
  },

  logout() {
    api.setToken(null);
    localStorage.removeItem("occasion_user");
  },

  getCurrentUser() {
    try {
      const saved = localStorage.getItem("occasion_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(api.getToken());
  },
};
