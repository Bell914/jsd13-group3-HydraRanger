import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const createOrder = async (orderData) => {
  // ดึง Token ของลูกค้าจาก localStorage หรือ Auth Store
  const token = localStorage.getItem('token'); 

  const response = await axios.post(`${API_URL}/orders`, orderData, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // ส่ง Token ไปตามที่เพื่อนแจ้ง
    },
  });

  return response.data;
};