import { VALID_COUPONS } from '../config/membershipConfig.js';
import { CouponRedemption } from '../models/CouponRedemption.js';

const TIER_CODES = {
  BRONZE: 'BRONZEVIP3',
  SILVER: 'SILVERVIP5',
  GOLD: 'GOLDVIP10',
  PLATINUM: 'PLATINUMVIP15'
};

const BIRTHDAY_CODES = {
  MEMBER: 'BDAY5',
  BRONZE: 'BDAY10',
  SILVER: 'BDAY15',
  GOLD: 'BDAY20',
  PLATINUM: 'BDAY25'
};

const monthKey = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

export function getCouponCampaignKey(coupon, now = new Date()) {
  if (coupon.cadence === 'once') return 'lifetime';
  if (coupon.cadence === 'yearly') return String(now.getUTCFullYear());
  return monthKey(now);
}

function endOfMonth(now) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

function getCouponExpiry(coupon, user, now) {
  if (coupon.cadence === 'once') return null;
  if (coupon.cadence === 'yearly' && user?.birthMonth) {
    return new Date(Date.UTC(now.getUTCFullYear(), Number(user.birthMonth), 0, 23, 59, 59, 999));
  }
  return endOfMonth(now);
}

function toPublicCoupon(coupon, user, redeemedKeys, now) {
  const campaignKey = getCouponCampaignKey(coupon, now);
  const isBirthdayMonth = Number(user?.birthMonth) === now.getUTCMonth() + 1;
  const isBirthdayCoupon = coupon.category === 'birthday';
  const alreadyRedeemed = redeemedKeys.has(`${coupon.code}:${campaignKey}`);
  const usable = !alreadyRedeemed && (!isBirthdayCoupon || isBirthdayMonth);

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
      ? 'ใช้สิทธิ์นี้แล้ว'
      : isBirthdayCoupon && !user?.birthMonth
        ? 'เพิ่มเดือนเกิดในโปรไฟล์เพื่อรับสิทธิ์'
        : isBirthdayCoupon && !isBirthdayMonth
          ? 'ใช้ได้เฉพาะเดือนเกิดของคุณ'
          : null
  };
}

export function buildCouponsForUser(user, redemptions = [], now = new Date()) {
  const rank = user?.membership?.rank || 'MEMBER';
  const redeemedKeys = new Set(
    redemptions.map((item) => `${String(item.code).toUpperCase()}:${item.campaignKey}`)
  );
  const codes = ['OCCWELCOME10'];
  if (TIER_CODES[rank]) codes.push(TIER_CODES[rank]);
  codes.push(BIRTHDAY_CODES[rank] || BIRTHDAY_CODES.MEMBER, 'OCCFREESHIP');
  return codes.map((code) => toPublicCoupon(VALID_COUPONS[code], user, redeemedKeys, now));
}

export async function getMyCoupons(user, now = new Date()) {
  const userId = user?._id || user?.id;
  const redemptions = await CouponRedemption.find({ user: userId }).select('code campaignKey').lean();
  return buildCouponsForUser(user, redemptions, now);
}

export function validateCouponForUser(user, code, subtotal, redemptions = [], now = new Date()) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const coupon = buildCouponsForUser(user, redemptions, now).find((item) => item.code === normalizedCode);
  if (!coupon) throw new Error('Coupon is not available for this membership');
  if (!coupon.usable) throw new Error(coupon.unavailableReason || 'Coupon is not available');
  if (subtotal < coupon.minSpend) {
    throw new Error(`Coupon requires a minimum spend of ${coupon.minSpend}`);
  }
  return coupon;
}

export async function reserveCoupon(user, code, subtotal, now = new Date()) {
  if (!code) return { coupon: null, reservation: null };
  const coupon = validateCouponForUser(user, code, subtotal, [], now);
  try {
    const reservation = await CouponRedemption.create({
      user: user._id || user.id,
      code: coupon.code,
      campaignKey: coupon.campaignKey,
      status: 'reserved'
    });
    return { coupon, reservation };
  } catch (error) {
    if (error?.code === 11000) throw new Error('Coupon has already been used');
    throw error;
  }
}

export async function completeCouponRedemption(reservation, order) {
  if (!reservation) return;
  reservation.order = order._id;
  reservation.status = 'redeemed';
  reservation.redeemedAt = new Date();
  await reservation.save();
}

export async function releaseCouponReservation(reservation) {
  if (!reservation) return;
  await CouponRedemption.deleteOne({ _id: reservation._id, status: 'reserved' });
}
