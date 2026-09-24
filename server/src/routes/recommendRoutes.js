import { Router } from "express";
import { recommendLookbooks, memoryUpload } from "../controllers/recommendController.js";

import { rateLimit } from '../middleware/rateLimiterMiddleware.js';

const router = Router();
const recommendLimiter = rateLimit({
  name: 'recommend-images',
  shared: true,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'วิเคราะห์รูปได้ไม่เกิน 10 ครั้งใน 15 นาที กรุณาลองใหม่ภายหลัง'
});

router.post("/", recommendLimiter, memoryUpload, recommendLookbooks);

export default router;
