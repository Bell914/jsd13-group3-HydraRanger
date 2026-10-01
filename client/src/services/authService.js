import { api } from "./api.js";

export const authService = {
  async register(userData) {
    const res = await api.post("/auth/register", userData);
    if (res.data?.user) {
      localStorage.setItem("occasion_user", JSON.stringify(res.data.user));
    }
    return res;
  },

  async login(credentials) {
    const res = await api.post("/auth/login", credentials);
    if (res.data?.user) {
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

  async forgotPassword(email) {
    return await api.post("/auth/forgot-password", { email });
  },

  async resetPassword({ token, password }) {
    return await api.post(`/auth/reset-password/${token}`, { password });
  },

  async refresh() {
    return await api.post("/auth/refresh", {});
  },

  async logout() {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // Local session data must still be cleared when the server is unavailable.
    } finally {
      localStorage.removeItem("occasion_token");
      localStorage.removeItem("occasion_user");
    }
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
    return Boolean(this.getCurrentUser());
  },
};

export const { forgotPassword, resetPassword } = authService;
