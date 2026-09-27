import { adminRequest } from './adminApi.js';

async function sendRequest(path, options = {}) {
  const result = await adminRequest(path, {
    ...options,
    errorMessage: 'จัดการข้อมูลคำสั่งซื้อไม่สำเร็จ',
    networkMessage: 'เชื่อมต่อข้อมูลคำสั่งซื้อไม่ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่'
  });
  return result.data;
}

export function getOrders() {
  return sendRequest('/admin/orders');
}

export function updateOrderStatus(orderId, status) {
  return sendRequest(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}
