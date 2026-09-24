const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
async function sendRequest(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
