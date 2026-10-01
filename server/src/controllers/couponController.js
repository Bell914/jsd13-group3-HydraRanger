import { User } from "../models/User.js";
import { VALID_COUPONS } from "../config/membershipConfig.js";
import { validateCoupon, validateMembershipCouponForUser } from "../services/couponService.js";

// POST /api/coupons/validate
export const checkCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    // ดึง userId จาก Token ของ User ที่ Login อยู่
    const userId = req.user._id || req.user.id;

    const normalizedCode = String(code || "").trim().toUpperCase();
    const normalizedSubtotal = Number(subtotal || 0);
    let result;

    if (VALID_COUPONS[normalizedCode]) {
      const user = await User.findById(userId).lean();
      if (!user) throw new Error("User not found");
      result = await validateMembershipCouponForUser(user, normalizedCode, normalizedSubtotal);
    } else {
      result = await validateCoupon({
        code: normalizedCode,
        userId,
        subtotal: normalizedSubtotal,
      });
    }

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
