const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const TOKEN_KEY = 'occasion_admin_token';

async function sendRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('ไม่พบสิทธิ์ Admin กรุณาเข้าสู่ระบบใหม่');

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'จัดการข้อมูล Order ไม่สำเร็จ');
    return result.data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('เชื่อมต่อ Order API ไม่ได้ กรุณาตรวจสอบว่า Server เปิดอยู่');
    }
    throw error;
  }
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
