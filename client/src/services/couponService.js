import { api } from "./api.js";

export const couponService = {
  /**
   * Validate a coupon code with backend
   * @param {string} code - The coupon code
   * @param {number} subtotal - Order subtotal
   * @returns {Promise<{success: boolean, message: string, data: object}>}
   */
  async validateCoupon(code, subtotal = 0) {
    const response = await api.post("/coupons/validate", {
      code: String(code || "").trim().toUpperCase(),
      subtotal: Number(subtotal || 0),
    });
    return response;
  },
};

export default couponService;
