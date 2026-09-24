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

// 2. ตรวจสอบคูปอง (Validate) ก่อน Checkout - Query ด้วย code + userId
export const validateCoupon = async ({ code, userId, subtotal }) => {
  if (!code) throw new Error("กรุณากรอกโค้ดส่วนลด");
  if (!userId) throw new Error("กรุณาเข้าสู่ระบบก่อนใช้งานคูปอง");

  // Query ด้วยทั้ง code และ userId เพื่อป้องกันการชนกันของคูปอง WELCOME5 ของแต่ละบัญชี
  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    userId,
  });

  if (!coupon) {
    throw new Error("ไม่พบโค้ดส่วนลดนี้ในระบบ หรือคุณไม่มีสิทธิ์ใช้งาน");
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

// 3. Claim coupon แบบ Atomic เพื่อป้องกัน Race Condition / Double Claim เมื่อมี 2 checkout พร้อมกัน
export const claimCouponAtomically = async ({ code, userId, orderId = null }) => {
  if (!code || !userId) return null;

  return await Coupon.findOneAndUpdate(
    {
      code: code.trim().toUpperCase(),
      userId,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        isUsed: true,
        usedAt: new Date(),
        ...(orderId ? { orderId } : {}),
      },
    },
    { new: true }
  );
};

// 4. ปรับสถานะเป็น Used เมื่อสั่งซื้อ/ชำระเงินสำเร็จ (Atomic Update)
export const markCouponAsUsed = async (couponId, orderId) => {
  if (!couponId) return null;
  return await Coupon.findOneAndUpdate(
    {
      _id: couponId,
      isUsed: false,
    },
    {
      $set: {
        isUsed: true,
        usedAt: new Date(),
        orderId,
      },
    },
    { new: true }
  );
};

// 5. คืนสิทธิ์การใช้งานคูปองกรณี Order ถูก Cancel หรือ Refund
export const refundCouponUsage = async ({ code, userId, orderId }) => {
  if (!code || !userId || !orderId) return null;
  return await Coupon.findOneAndUpdate(
    { code: code.trim().toUpperCase(), userId, orderId, isUsed: true },
    {
      isUsed: false,
      usedAt: null,
      orderId: null,
    },
    { new: true }
  );
};
