import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    // ผูก Coupon กับ userId (1 บัญชีต่อ 1 สิทธิ์)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Compound Unique Index ป้องกันการสร้าง Welcome Coupon ซ้ำให้ User เดิม
couponSchema.index({ userId: 1, type: 1 }, { unique: true });

export const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
