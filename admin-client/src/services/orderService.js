import { adminRequest } from './adminApi.js';

async function sendRequest(path, options = {}) {
  const result = await adminRequest(path, {
    ...options,
    errorMessage: 'จัดการข้อมูล Order ไม่สำเร็จ',
    networkMessage: 'เชื่อมต่อ Order API ไม่ได้ กรุณาตรวจสอบว่า Server เปิดอยู่'
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
