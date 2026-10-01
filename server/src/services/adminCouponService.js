import { Coupon } from '../models/couponModel.js';
import { CouponRedemption } from '../models/CouponRedemption.js';
import { VALID_COUPONS } from '../config/membershipConfig.js';

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

export async function getAdminMembershipCouponRedemptions() {
  const redemptions = await CouponRedemption.find()
    .populate('user', 'username email')
    .populate('order', 'orderNumber')
    .sort({ createdAt: -1 })
    .lean();

  return redemptions.map((redemption) => {
    const coupon = VALID_COUPONS[redemption.code];
    return {
      ...redemption,
      couponTitle: coupon?.title || redemption.code,
      discountType: coupon?.type || 'percent',
      discountValue: coupon?.value || 0,
    };
  });
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
