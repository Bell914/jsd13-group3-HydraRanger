import { Router } from "express";
import { checkCoupon } from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";

export const router = Router();

// ต้อง Login ก่อนถึงจะใช้คูปองได้
router.post("/validate", protect, checkCoupon);

export default router;

