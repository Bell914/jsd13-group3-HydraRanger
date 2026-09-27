import { adminRequest } from './adminApi.js';

async function sendRequest(path, options = {}) {
  const result = await adminRequest(path, {
    ...options,
    errorMessage: 'โหลดข้อมูลลูกค้าไม่สำเร็จ',
    networkMessage: 'เชื่อมต่อข้อมูลลูกค้าไม่ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่'
  });
  return result.data;
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
