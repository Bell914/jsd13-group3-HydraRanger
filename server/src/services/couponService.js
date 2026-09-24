import { Coupon } from "../models/couponModel.js";
import { WELCOME_COUPON } from "../config/constants.js";

// 1. สร้าง Welcome Coupon 5% ให้ลูกค้าใหม่ (ป้องกันการสร้างซ้ำ)
export const createWelcomeCouponForUser = async (userId) => {
  try {
    const existing = await Coupon.findOne({ userId, type: "WELCOME" });
    if (existing) return existing;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (WELCOME_COUPON?.EXPIRES_IN_DAYS || 30));

    return await Coupon.create({
      code: WELCOME_COUPON?.CODE || "WELCOME5",
      userId,
      discountValue: WELCOME_COUPON?.DISCOUNT_PERCENT || 5,
      type: "WELCOME",
      expiresAt,
      isUsed: false,
    });
  } catch (error) {
    if (error.code === 11000) {
      return await Coupon.findOne({ userId, type: "WELCOME" });
    }
    console.error("Failed to create welcome coupon:", error);
    throw error;
  }
};

// 2. ตรวจสอบคูปอง (Validate) ก่อน Checkout
export const validateCoupon = async ({ code, userId, subtotal }) => {
  if (!code) throw new Error("กรุณากรอกโค้ดส่วนลด");

  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
  });

  if (!coupon) {
    throw new Error("ไม่พบโค้ดส่วนลดนี้ในระบบ");
  }

  // ตรวจสอบความเป็นเจ้าของคูปอง (User ที่ Login เท่านั้น)
  if (coupon.userId.toString() !== userId.toString()) {
    throw new Error("คุณไม่มีสิทธิ์ใช้งานคูปองนี้ (คูปองนี้เป็นของบัญชีอื่น)");
  }

  // ตรวจสอบว่าถูกใช้แล้วหรือยัง
  if (coupon.isUsed) {
    throw new Error("คูปองนี้ถูกใช้งานไปแล้ว ไม่สามารถใช้ซ้ำได้");
  }

  // ตรวจสอบวันหมดอายุ
  if (new Date() > coupon.expiresAt) {
    throw new Error("คูปองนี้หมดอายุการใช้งานแล้ว");
  }

  // ตรวจสอบยอดซื้อขั้นต่ำ
  const minPurchase = WELCOME_COUPON?.MIN_PURCHASE || 0;
  if (subtotal < minPurchase) {
    throw new Error(`ยอดซื้อขั้นต่ำต้องไม่น้อยกว่า ฿${minPurchase}`);
  }

  // คำนวณส่วนลด 5% ที่ Backend
  const discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return {
    valid: true,
    couponId: coupon._id,
    code: coupon.code,
    discountValue: coupon.discountValue,
    discountAmount,
    finalTotal,
  };
};

// 3. ปรับสถานะเป็น Used เมื่อสั่งซื้อ/ชำระเงินสำเร็จ (Atomic Update)
export const markCouponAsUsed = async (couponId, orderId) => {
  if (!couponId) return;
  return await Coupon.findByIdAndUpdate(
    couponId,
    {
      isUsed: true,
      usedAt: new Date(),
      orderId,
    },
    { new: true }
  );
};

// 4. คืนสิทธิ์การใช้งานคูปองกรณี Order ถูก Cancel หรือ Refund
export const refundCouponUsage = async ({ code, userId, orderId }) => {
  return await Coupon.findOneAndUpdate(
    { code: code.toUpperCase(), userId },
    {
      isUsed: false,
      usedAt: null,
      orderId: null,
    },
    { new: true }
  );
};
