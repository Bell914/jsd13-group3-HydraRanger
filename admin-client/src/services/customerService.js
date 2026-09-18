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
    if (!response.ok) throw new Error(result.message || 'โหลดข้อมูลลูกค้าไม่สำเร็จ');
    return result.data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('เชื่อมต่อ Customer API ไม่ได้ กรุณาตรวจสอบว่า Server เปิดอยู่');
    }
    throw error;
  }
}

export function getCustomers() {
  return sendRequest('/admin/customers');
}

export function updateCustomer(customerId, customerData) {
  return sendRequest(`/admin/customers/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify(customerData)
  });
}

export function updateCustomerStatus(customerId, isActive) {
  return sendRequest(`/admin/customers/${customerId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive })
  });
}
