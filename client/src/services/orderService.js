import { api } from './api.js';

// สร้าง Order ใหม่
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// ดึงรายการคำสั่งซื้อทั้งหมดของผู้ใช้
export const getMyOrders = async () => {
  const response = await api.get("/orders/my");
  return response.data;
};

// ดึงรายละเอียด Order รายการเดียว
export const getOrderDetail = async (orderId) => {
  const response = await api.get(`/orders/my/${orderId}`);
  return response.data;
};

// (Optional) ยกเลิก Order
export const cancelOrder = async (orderId) => {
  const response = await api.patch(`/orders/my/${orderId}/cancel`);
  return response.data;
};