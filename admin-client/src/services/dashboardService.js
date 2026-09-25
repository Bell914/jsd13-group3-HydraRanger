const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
export async function getDashboardSummary() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      credentials: 'include'
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
