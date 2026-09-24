import { api } from './api.js';

// โครงสร้าง Object เดิม (คงไว้เพื่อไม่ให้ส่วนอื่นที่เรียกใช้พัง)
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

// ==========================================
// Shipping Address Services (สำหรับ ProfilePage)
// ==========================================

export const getAddresses = async () => {
  return await api.get('/users/addresses');
};

export const addAddress = async (addressData) => {
  return await api.post('/users/addresses', addressData);
};

export const updateAddress = async (addressId, addressData) => {
  return await api.put(`/users/addresses/${addressId}`, addressData);
};

export const deleteAddress = async (addressId) => {
  return await api.delete(`/users/addresses/${addressId}`);
};

export const setDefaultAddress = async (addressId) => {
  return await api.patch(`/users/addresses/${addressId}/default`);
};
