import { api } from './api.js';

export const itemService = {
  async getItems(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await api.get(`/items${queryString}`);
  },

  async getItemById(id) {
    return await api.get(`/items/${id}`);
  },

  async createItem(itemData) {
    return await api.post('/items', itemData);
  },

  async updateItem(id, itemData) {
    return await api.put(`/items/${id}`, itemData);
  },

  async deleteItem(id) {
    return await api.delete(`/items/${id}`);
  }
};
