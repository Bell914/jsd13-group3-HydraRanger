import rateLimit from "express-rate-limit";

// Rate Limiter สำหรับ Login และ Register (จำกัด 30 ครั้ง / 15 นาที)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      success: false,
      message: "ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่",
    });
  },
});

// Rate Limiter สำหรับ Request Reset Password (จำกัด 5 ครั้ง / 1 ชั่วโมง)
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      success: false,
      message: "ขอส่งลิงก์รีเซ็ตรหัสผ่านหลายครั้งเกินไป กรุณารอ 1 ชั่วโมงแล้วลองใหม่",
    });
  },
});