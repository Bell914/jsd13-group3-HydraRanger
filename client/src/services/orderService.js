import { api } from './api.js';

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/my');
  return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
};

export const getOrderDetail = async (orderId) => {
  const response = await api.get(`/orders/my/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await api.patch(`/orders/my/${orderId}/cancel`);
  return response.data;
};
