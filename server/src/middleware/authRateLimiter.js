import { rateLimit } from './rateLimiterMiddleware.js';

// Rate Limiter สำหรับ Login และ Register (จำกัด 30 ครั้ง / 15 นาที)
export const authRateLimiter = rateLimit({
  name: 'auth-general',
  shared: true,
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่",
});

// Rate Limiter สำหรับ Request Reset Password (จำกัด 5 ครั้ง / 1 ชั่วโมง)
export const forgotPasswordLimiter = rateLimit({
  name: 'forgot-password',
  shared: true,
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "ขอส่งลิงก์รีเซ็ตรหัสผ่านหลายครั้งเกินไป กรุณารอ 1 ชั่วโมงแล้วลองใหม่",
});
