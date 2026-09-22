import { Router } from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, authorize("admin"), uploadImage);

export default router;
