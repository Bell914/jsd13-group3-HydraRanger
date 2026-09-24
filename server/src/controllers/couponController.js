import { validateCoupon } from "../services/couponService.js";

// POST /api/coupons/validate
export const checkCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    // ดึง userId จาก Token ของ User ที่ Login อยู่
    const userId = req.user._id || req.user.id;

    const result = await validateCoupon({
      code,
      userId,
      subtotal: Number(subtotal || 0),
    });

    return res.status(200).json({
      success: true,
      message: "คูปองถูกต้อง",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
