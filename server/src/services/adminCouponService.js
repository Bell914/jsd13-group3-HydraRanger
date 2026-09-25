import { Coupon } from '../models/couponModel.js';

function prepareCoupon(data) {
  return {
    code: String(data.code).trim().toUpperCase(),
    discountValue: Number(data.discountValue),
    minPurchase: Number(data.minPurchase || 0),
    eventName: String(data.eventName || '').trim(),
    expiresAt: new Date(data.expiresAt),
    isActive: data.isActive ?? true,
    type: 'GENERAL',
    userId: null,
    isUsed: false,
    usedAt: null,
    orderId: null,
  };
}

export function getAdminCoupons() {
  return Coupon.find({ type: 'GENERAL' }).sort({ createdAt: -1 });
}

export function createAdminCoupon(data) {
  return Coupon.create(prepareCoupon(data));
}

export async function updateAdminCoupon(id, data) {
  const coupon = await Coupon.findOneAndUpdate(
    { _id: id, type: 'GENERAL' },
    prepareCoupon(data),
    { new: true, runValidators: true }
  );
  if (!coupon) throw new Error('Coupon not found');
  return coupon;
}

export async function updateAdminCouponStatus(id, isActive) {
  const coupon = await Coupon.findOneAndUpdate(
    { _id: id, type: 'GENERAL' },
    { isActive },
    { new: true, runValidators: true }
  );
  if (!coupon) throw new Error('Coupon not found');
  return coupon;
}
