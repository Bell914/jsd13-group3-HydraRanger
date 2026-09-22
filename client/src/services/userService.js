import { api } from './api.js';

export const userService = {
  async getUsers() {
    return await api.get('/users');
  },

  async getUserById(id) {
    return await api.get(`/users/${id}`);
  },

  async getSizeProfile() {
    const response = await api.get('/users/me/size-profile');
    return response.data;
  },

  async saveSizeProfile(profile) {
    const response = await api.put('/users/me/size-profile', profile);
    return response.data;
  },

  async deleteSizeProfile() {
    return await api.delete('/users/me/size-profile');
  }
};
