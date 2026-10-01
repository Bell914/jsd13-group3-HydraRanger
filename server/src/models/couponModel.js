import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    // Welcome coupons are owned by a user; GENERAL coupons are reusable.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    discountValue: {
      type: Number,
      required: true,
      default: 5, // 5%
    },
    type: {
      type: String,
      enum: ["WELCOME", "GENERAL"],
      default: "WELCOME",
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    eventName: {
      type: String,
      trim: true,
      default: '',
      maxlength: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// One welcome coupon per user, while general coupons must have unique codes.
couponSchema.index(
  { userId: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "WELCOME" } }
);
couponSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { type: "GENERAL" } }
);

export const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
