import { Coupon } from "../models/couponModel.js";
import { WELCOME_COUPON } from "../config/constants.js";
import { VALID_COUPONS } from "../config/membershipConfig.js";
import { CouponRedemption } from "../models/CouponRedemption.js";

const RESERVATION_TTL_MS = 15 * 60 * 1000;
const TIER_CODES = {
  BRONZE: "BRONZEVIP3",
  SILVER: "SILVERVIP5",
  GOLD: "GOLDVIP10",
  PLATINUM: "PLATINUMVIP15",
};
const BIRTHDAY_CODES = {
  MEMBER: "BDAY5",
  BRONZE: "BDAY10",
  SILVER: "BDAY15",
  GOLD: "BDAY20",
  PLATINUM: "BDAY25",
};

export class CouponValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "CouponValidationError";
    this.statusCode = 400;
  }
}

const monthKey = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

const getBirthMonth = (user) => {
  const configuredMonth = Number(user?.birthMonth);
  if (Number.isInteger(configuredMonth) && configuredMonth >= 1 && configuredMonth <= 12) {
    return configuredMonth;
  }
  if (!user?.birthday) return null;
  const birthday = new Date(user.birthday);
  return Number.isNaN(birthday.getTime()) ? null : birthday.getUTCMonth() + 1;
};

export function getCouponCampaignKey(coupon, now = new Date()) {
  if (coupon.cadence === "once") return "lifetime";
  if (coupon.cadence === "yearly") return String(now.getUTCFullYear());
  return monthKey(now);
}

function getCouponExpiry(coupon, user, now) {
  if (coupon.cadence === "once") return null;
  if (coupon.cadence === "yearly" && getBirthMonth(user)) {
    return new Date(Date.UTC(now.getUTCFullYear(), getBirthMonth(user), 0, 23, 59, 59, 999));
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

function toPublicCoupon(coupon, user, redemptions, now) {
  const campaignKey = getCouponCampaignKey(coupon, now);
  const birthdayMonth = getBirthMonth(user);
  const isBirthdayCoupon = coupon.category === "birthday";
  const isBirthdayMonth = birthdayMonth === now.getUTCMonth() + 1;
  const redemption = redemptions.find(
    (item) => String(item.code).toUpperCase() === coupon.code && item.campaignKey === campaignKey,
  );
  const reservationActive =
    redemption?.status === "reserved" &&
    (!redemption.reservedUntil || new Date(redemption.reservedUntil) > now);
  const alreadyRedeemed = redemption?.status === "redeemed" || (!redemption?.status && Boolean(redemption));
  const usable = !alreadyRedeemed && !reservationActive && (!isBirthdayCoupon || isBirthdayMonth);

  return {
    id: `${coupon.code}:${campaignKey}`,
    code: coupon.code,
    title: coupon.title,
    discountType: coupon.type,
    discountValue: coupon.value,
    minSpend: coupon.minSpend || 0,
    category: coupon.category,
    badge: coupon.badge,
    campaignKey,
    expiresAt: getCouponExpiry(coupon, user, now)?.toISOString() || null,
    usable,
    alreadyRedeemed,
    unavailableReason: alreadyRedeemed
      ? "ใช้สิทธิ์นี้แล้ว"
      : reservationActive
        ? "คูปองกำลังถูกใช้ในคำสั่งซื้ออื่น"
        : isBirthdayCoupon && !birthdayMonth
          ? "เพิ่มวันเกิดในโปรไฟล์เพื่อรับสิทธิ์"
          : isBirthdayCoupon && !isBirthdayMonth
            ? "ใช้ได้เฉพาะเดือนเกิดของคุณ"
            : null,
  };
}

export function buildCouponsForUser(user, redemptions = [], now = new Date()) {
  const rank = user?.membership?.rank || "MEMBER";
  const codes = ["OCCWELCOME10"];
  if (TIER_CODES[rank]) codes.push(TIER_CODES[rank]);
  codes.push(BIRTHDAY_CODES[rank] || BIRTHDAY_CODES.MEMBER, "OCCFREESHIP");
  return codes.map((code) => toPublicCoupon(VALID_COUPONS[code], user, redemptions, now));
}

export function validateCouponForUser(user, code, subtotal, redemptions = [], now = new Date()) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const coupon = buildCouponsForUser(user, redemptions, now).find(
    (item) => item.code === normalizedCode,
  );
  if (!coupon) throw new CouponValidationError("Coupon is not available for this membership");
  if (!coupon.usable) {
    throw new CouponValidationError(coupon.unavailableReason || "Coupon is not available");
  }
  if (subtotal < coupon.minSpend) {
    throw new CouponValidationError(`Coupon requires a minimum spend of ${coupon.minSpend}`);
  }
  return coupon;
}

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
  let coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    userId,
  });

  // General coupons are created by an administrator and are reusable; they
  // remain protected by the authenticated validation endpoint.
  if (!coupon) {
    coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      type: "GENERAL",
      isActive: true,
    });
  }

  if (!coupon) {
    throw new Error("ไม่พบโค้ดส่วนลดนี้ในระบบ หรือคุณไม่มีสิทธิ์ใช้งาน");
  }

  // ตรวจสอบว่าถูกใช้แล้วหรือยัง
  if (coupon.type !== "GENERAL" && coupon.isUsed) {
    throw new Error("คูปองนี้ถูกใช้งานไปแล้ว ไม่สามารถใช้ซ้ำได้");
  }

  // ตรวจสอบวันหมดอายุ
  if (new Date() > coupon.expiresAt) {
    throw new Error("คูปองนี้หมดอายุการใช้งานแล้ว");
  }

  // ตรวจสอบยอดซื้อขั้นต่ำ
  const minPurchase = coupon.minPurchase ?? WELCOME_COUPON?.MIN_PURCHASE ?? 0;
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

export const getActiveGeneralCoupon = async (code, subtotal = 0) => {
  if (!code) return null;
  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    type: "GENERAL",
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
  if (!coupon || subtotal < (coupon.minPurchase || 0)) return null;
  return coupon;
};

// 3. Claim coupon แบบ Atomic เพื่อป้องกัน Race Condition / Double Claim เมื่อมี 2 checkout พร้อมกัน
export const claimCouponAtomically = async ({ code, userId, orderId = null }) => {
  if (!code || !userId) return null;

  return await Coupon.findOneAndUpdate(
    {
      code: code.trim().toUpperCase(),
      userId,
      type: "WELCOME",
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

export async function getMyCoupons(user, now = new Date()) {
  const userId = user?._id || user?.id;
  await CouponRedemption.deleteMany({
    user: userId,
    status: "reserved",
    reservedUntil: { $lte: now },
  });
  const redemptions = await CouponRedemption.find({ user: userId })
    .select("code campaignKey status reservedUntil")
    .lean();
  return buildCouponsForUser(user, redemptions, now);
}

export async function reserveMembershipCoupon(user, code, subtotal, now = new Date()) {
  if (!code) return { coupon: null, reservation: null };
  const normalizedCode = String(code).trim().toUpperCase();
  if (!VALID_COUPONS[normalizedCode]) return { coupon: null, reservation: null };

  const userId = user?._id || user?.id;
  await CouponRedemption.deleteMany({
    user: userId,
    code: normalizedCode,
    status: "reserved",
    reservedUntil: { $lte: now },
  });
  const redemptions = await CouponRedemption.find({
    user: userId,
    code: normalizedCode,
  }).lean();
  const coupon = validateCouponForUser(user, normalizedCode, subtotal, redemptions, now);

  try {
    const reservation = await CouponRedemption.create({
      user: userId,
      code: coupon.code,
      campaignKey: coupon.campaignKey,
      status: "reserved",
      reservedUntil: new Date(now.getTime() + RESERVATION_TTL_MS),
    });
    return { coupon, reservation };
  } catch (error) {
    if (error?.code === 11000) {
      throw new CouponValidationError("Coupon has already been used");
    }
    throw error;
  }
}

export async function completeCouponRedemption(reservation, order) {
  if (!reservation) return;
  reservation.order = order._id;
  reservation.status = "redeemed";
  reservation.redeemedAt = new Date();
  reservation.reservedUntil = null;
  await reservation.save();
}

export async function releaseCouponReservation(reservation) {
  if (!reservation) return;
  await CouponRedemption.deleteOne({ _id: reservation._id, status: "reserved" });
}

export async function refundMembershipCouponUsage({ code, userId, orderId }) {
  if (!code || !userId || !orderId) return null;
  return CouponRedemption.findOneAndDelete({
    code: String(code).trim().toUpperCase(),
    user: userId,
    order: orderId,
    status: "redeemed",
  });
}
