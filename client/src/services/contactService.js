import { api } from "./api"; // ปรับ Path ให้ตรงกับตำแหน่งที่คุณเก็บไฟล์ ApiClient (เช่น api.js หรือ apiClient.js)

export const contactService = {
  // ฟังก์ชันส่งข้อความติดต่อ (Customer Service / Contact Form)
  submitContact: async (formData) => {
    // ใช้ api.post ที่คุณเขียนไว้ใน ApiClient (มันจะจัดการ JSON.stringify และ Base URL ให้เอง)
    return await api.post("/contact", formData);
  },
};
