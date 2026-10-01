import { adminRequest } from './adminApi.js';

export async function getDashboardSummary() {
  const result = await adminRequest('/admin/dashboard', {
    errorMessage: 'โหลดข้อมูลภาพรวมร้านค้าไม่สำเร็จ',
    networkMessage: 'เชื่อมต่อข้อมูลภาพรวมร้านค้าไม่ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่'
  });
  return result.data;
}
