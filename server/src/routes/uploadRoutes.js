import { Router } from "express";
import { getImage, uploadImage } from "../controllers/uploadController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { rateLimit } from "../middleware/rateLimiterMiddleware.js";

const router = Router();
const uploadLimiter = rateLimit({
  name: "product-image-upload",
  shared: true,
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "อัปโหลดรูปบ่อยเกินไป กรุณาลองใหม่ภายหลัง",
});

router.get("/:id", getImage);
router.post("/", protect, authorize("admin"), uploadLimiter, uploadImage);

export default router;
