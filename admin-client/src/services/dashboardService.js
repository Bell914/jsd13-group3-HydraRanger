import { adminRequest } from './adminApi.js';

export async function getDashboardSummary() {
  const result = await adminRequest('/admin/dashboard', {
    errorMessage: 'โหลดข้อมูล Dashboard ไม่สำเร็จ',
    networkMessage: 'เชื่อมต่อ Dashboard API ไม่ได้ กรุณาตรวจสอบว่า Server เปิดอยู่'
  });
  return result.data;
}
