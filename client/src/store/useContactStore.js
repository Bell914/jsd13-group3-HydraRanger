import { create } from "zustand";
import { contactService } from "../services/contactService"; // ดึง Service ที่เพิ่งสร้างมาใช้

export const useContactStore = create((set) => ({
  loading: false,
  statusMsg: null,

  clearStatusMsg: () => set({ statusMsg: null }),

  submitContactForm: async (formData) => {
    set({ loading: true, statusMsg: null });

    try {
      // เรียกใช้งานผ่าน contactService
      const data = await contactService.submitContact(formData);

      set({
        statusMsg: {
          type: "success",
          text:
            data.message || "ส่งข้อความสำเร็จ ทีมงานจะติดต่อกลับโดยเร็วที่สุด",
        },
        loading: false,
      });

      return true;
    } catch (error) {
      // ดึง Error message ที่ ApiClient โยนออกมาให้
      set({
        statusMsg: {
          type: "error",
          text: error.message || "เกิดข้อผิดพลาด ไม่สามารถส่งข้อความได้",
        },
        loading: false,
      });

      return false;
    }
  },
}));
