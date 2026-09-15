const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const TOKEN_KEY = 'occasion_admin_token';

export async function getDashboardSummary() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('ไม่พบสิทธิ์ Admin กรุณาเข้าสู่ระบบใหม่');

    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'โหลดข้อมูล Dashboard ไม่สำเร็จ');
    }
    return result.data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('เชื่อมต่อ Dashboard API ไม่ได้ กรุณาตรวจสอบว่า Server เปิดอยู่');
    }
    throw error;
  }
}
