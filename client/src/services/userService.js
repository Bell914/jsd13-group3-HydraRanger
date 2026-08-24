import { api } from './api.js';

export const userService = {
  async getUsers() {
    return await api.get('/users');
  },

  async getUserById(id) {
    return await api.get(`/users/${id}`);
  }
};
