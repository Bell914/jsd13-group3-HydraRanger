import { api } from "./api"; // เปลี่ยนเป็น destructuring import ให้ตรงกับ export const api
/**
 * ยิง POST /orders เพื่อสร้างคำสั่งซื้อใหม่ลง MongoDB
 * @param {Object} orderData 
 * @returns {Promise<Object>}
 */
export const createOrder = async (orderData) => {
  // 💡 ใช้ api.post เพื่อให้ส่ง Token ใน Authorization Header ตรงตามระบบ Login ของทีม
  const response = await api.post("/orders", orderData);
  return response.data;
};