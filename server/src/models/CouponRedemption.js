import mongoose from 'mongoose';

const couponRedemptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    campaignKey: { type: String, required: true, trim: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    status: { type: String, enum: ['reserved', 'redeemed'], default: 'reserved' },
    reservedUntil: { type: Date, default: null },
    redeemedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// The database, not the browser, guarantees that a one-use coupon cannot be
// redeemed twice by concurrent checkout requests.
couponRedemptionSchema.index(
  { user: 1, code: 1, campaignKey: 1 },
  { unique: true, name: 'one_coupon_redemption_per_campaign' }
);
couponRedemptionSchema.index({ reservedUntil: 1 }, { expireAfterSeconds: 0 });

export const CouponRedemption =
  mongoose.models.CouponRedemption || mongoose.model('CouponRedemption', couponRedemptionSchema);
