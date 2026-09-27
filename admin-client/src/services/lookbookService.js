import { adminRequest } from './adminApi.js';

async function sendRequest(path, options = {}) {
  const result = await adminRequest(path, {
    ...options,
    errorMessage: 'จัดการลุคบุ๊กไม่สำเร็จ',
    networkMessage: 'เชื่อมต่อข้อมูลลุคบุ๊กไม่ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่'
  });
  return result.data;
}

export function getLookbooks() {
  return sendRequest('/admin/lookbooks');
}

export function createLookbook(lookbook) {
  return sendRequest('/admin/lookbooks', {
    method: 'POST',
    body: JSON.stringify(lookbook),
  });
}

export function updateLookbook(id, lookbook) {
  return sendRequest(`/admin/lookbooks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(lookbook),
  });
}

export function updateLookbookStatus(id, isActive) {
  return sendRequest(`/admin/lookbooks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}
