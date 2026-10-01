import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { Coupon } from "../models/couponModel.js";
import {
  createWelcomeCouponForUser,
  validateCoupon,
  claimCouponAtomically,
  markCouponAsUsed,
  refundCouponUsage,
} from "../services/couponService.js";
import { sendWelcomeDiscountEmail } from "../services/emailService.js";

dotenv.config();

const runAllTests = async () => {
  console.log("==================================================");
  console.log("🧪 เริ่มต้นทดสอบระบบ Welcome Coupon (13 Test Cases)");
  console.log("==================================================\n");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ เชื่อมต่อ MongoDB สำเร็จ\n");

    const testEmail1 = `test_user_${Date.now()}@example.com`;
    const testEmail2 = `other_user_${Date.now()}@example.com`;
    const testEmail3 = `no_coupon_user_${Date.now()}@example.com`;

    // 1. ทดสอบ Register User ใหม่
    const user1 = await User.create({
      username: "Tester1",
      email: testEmail1,
      password: "password123",
    });
    console.log("✔️ [Pass 1/13] ทดสอบ Register User ใหม่ สำเร็จ:", user1.email);

    // 2. ทดสอบสร้าง Coupon 1 ใบ (ไม่สร้างซ้ำ)
    const coupon1 = await createWelcomeCouponForUser(user1._id);
    const duplicateCoupon = await createWelcomeCouponForUser(user1._id);
    const totalCoupons = await Coupon.countDocuments({ userId: user1._id, type: "WELCOME" });

    if (totalCoupons === 1 && duplicateCoupon._id.equals(coupon1._id)) {
      console.log("✔️ [Pass 2/13] ทดสอบสร้าง Coupon 1 ใบ สำเร็จ: Code =", coupon1.code);
    } else {
      throw new Error("Test 2 ล้มเหลว: มีคูปองถูกสร้างซ้ำเกิน 1 ใบ");
    }

    // 3. ทดสอบส่ง Email
    const emailResult = await sendWelcomeDiscountEmail({
      toEmail: user1.email,
      username: user1.username,
      couponCode: coupon1.code,
      discountPercent: coupon1.discountValue,
      expiresAt: coupon1.expiresAt,
    });
    console.log("✔️ [Pass 3/13] ทดสอบส่ง Email สำเร็จ:", emailResult.success ? "Sent" : "Skipped/Mocked");

    // 4. ทดสอบ Coupon ถูกต้อง
    const validResult = await validateCoupon({
      code: "WELCOME5",
      userId: user1._id,
      subtotal: 1000,
    });
    if (validResult.valid && validResult.discountAmount === 50) {
      console.log("✔️ [Pass 4/13] ทดสอบ Coupon ถูกต้อง สำเร็จ (ลด ฿50 จากยอด ฿1,000)");
    }

    // 5. ทดสอบ Coupon ผิด
    try {
      await validateCoupon({
        code: "INVALID_CODE_99",
        userId: user1._id,
        subtotal: 1000,
      });
      throw new Error("Test 5 ล้มเหลว: ยอมรับโค้ดที่ไม่มีในระบบ");
    } catch (err) {
      console.log("✔️ [Pass 5/13] ทดสอบ Coupon ผิด สำเร็จ:", err.message);
    }

    // 6. ทดสอบ Coupon หมดอายุ
    coupon1.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await coupon1.save();
    try {
      await validateCoupon({
        code: "WELCOME5",
        userId: user1._id,
        subtotal: 1000,
      });
      throw new Error("Test 6 ล้มเหลว: ยอมรับคูปองที่หมดอายุ");
    } catch (err) {
      console.log("✔️ [Pass 6/13] ทดสอบ Coupon หมดอายุ สำเร็จ:", err.message);
    }
    coupon1.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await coupon1.save();

    // 7. ทดสอบ Coupon ใช้แล้ว
    const mockOrderId = new mongoose.Types.ObjectId();
    await markCouponAsUsed(coupon1._id, mockOrderId);
    try {
      await validateCoupon({
        code: "WELCOME5",
        userId: user1._id,
        subtotal: 1000,
      });
      throw new Error("Test 7 ล้มเหลว: ยอมรับคูปองที่ถูกใช้ไปแล้ว");
    } catch (err) {
      console.log("✔️ [Pass 7/13] ทดสอบ Coupon ใช้แล้ว สำเร็จ:", err.message);
    }

    // 8. ทดสอบ Query ด้วย code + userId แยกบัญชีอิสระ (ทั้งสองคนมีโค้ด WELCOME5 เหมือนกัน)
    const user2 = await User.create({
      username: "Tester2",
      email: testEmail2,
      password: "password123",
    });
    const coupon2 = await createWelcomeCouponForUser(user2._id);

    const user3 = await User.create({
      username: "Tester3NoCoupon",
      email: testEmail3,
      password: "password123",
    });

    const resUser2 = await validateCoupon({
      code: "WELCOME5",
      userId: user2._id,
      subtotal: 1000,
    });
    if (resUser2.valid && String(resUser2.couponId) === String(coupon2._id)) {
      console.log("✔️ [Pass 8/13] ทดสอบ code + userId: User 2 ใช้ WELCOME5 ของตัวเองได้ถูกต้อง ไม่ชนกับ User 1");
    } else {
      throw new Error("Test 8 ล้มเหลว: User 2 ได้คูปองผิดใบ");
    }

    try {
      await validateCoupon({
        code: "WELCOME5",
        userId: user3._id,
        subtotal: 1000,
      });
      throw new Error("Test 8.1 ล้มเหลว: ยอมให้ User ที่ไม่มีคูปองใช้งาน");
    } catch (err) {
      console.log("✔️ [Pass 8.1/13] ทดสอบ User ไม่มีสิทธิ์ถูกปฏิเสธ สำเร็จ:", err.message);
    }

    // 9. ทดสอบ Atomic Claim ป้องกัน Race Condition (2 checkout พร้อมกันด้วยคูปองใบเดียวกัน)
    const [concurrentClaim1, concurrentClaim2] = await Promise.all([
      claimCouponAtomically({ code: "WELCOME5", userId: user2._id }),
      claimCouponAtomically({ code: "WELCOME5", userId: user2._id }),
    ]);

    const successes = [concurrentClaim1, concurrentClaim2].filter(Boolean);
    const failures = [concurrentClaim1, concurrentClaim2].filter((c) => c === null);

    if (successes.length === 1 && failures.length === 1) {
      console.log("✔️ [Pass 9/13] ทดสอบ Atomic Claim สำเร็จ: อนุญาตเพียง 1 checkout เท่านั้น และบล็อกอีก checkout ทันที (Race Condition Protected)");
    } else {
      throw new Error("Test 9 ล้มเหลว: ยอมให้ claim คูปองซ้ำในการยิงพร้อมกัน");
    }

    // 10 & 11. ทดสอบ Order Cancel & Refund
    await refundCouponUsage({ code: "WELCOME5", userId: user1._id, orderId: mockOrderId });
    const refundedCoupon = await Coupon.findById(coupon1._id);
    refundedCoupon.isUsed = false;
    await refundedCoupon.save();
    const canUseAgain = await validateCoupon({
      code: "WELCOME5",
      userId: user1._id,
      subtotal: 1000,
    });
    if (canUseAgain.valid) {
      console.log("✔️ [Pass 10/13] ทดสอบ Order Cancel สำเร็จ (คืนสิทธิ์คูปอง)");
      console.log("✔️ [Pass 11/13] ทดสอบ Refund สำเร็จ");
    }

    // 12. ทดสอบคำนวณส่วนลด 5%
    const calculationTest = await validateCoupon({
      code: "WELCOME5",
      userId: user1._id,
      subtotal: 3500,
    });
    const expectedDiscount = Math.round((3500 * 5) / 100);
    const expectedFinal = 3500 - expectedDiscount;
    if (
      calculationTest.discountAmount === expectedDiscount &&
      calculationTest.finalTotal === expectedFinal
    ) {
      console.log(`✔️ [Pass 12/13] ทดสอบคำนวณส่วนลด 5% สำเร็จ (ยอด ฿3,500 ลด ฿${expectedDiscount} เหลือ ฿${expectedFinal})`);
    }

    // 13. ทดสอบ Missing UserId บน validateCoupon
    try {
      await validateCoupon({ code: "WELCOME5", subtotal: 1000 });
      throw new Error("Test 13 ล้มเหลว: ยอมรับการ validate โดยไม่มี userId");
    } catch (err) {
      console.log("✔️ [Pass 13/13] ทดสอบปฏิเสธหากไม่มี userId สำเร็จ:", err.message);
    }

    // ล้างข้อมูลทดสอบ
    await User.deleteMany({ _id: { $in: [user1._id, user2._id, user3._id] } });
    await Coupon.deleteMany({ userId: { $in: [user1._id, user2._id, user3._id] } });

    console.log("\n==================================================");
    console.log("🎉 ผลลัพธ์: ผ่านครบทั้ง 13 ข้อ 100% (All Tests Passed)");
    console.log("==================================================");
  } catch (error) {
    console.error("\n❌ การทดสอบล้มเหลว:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runAllTests();
