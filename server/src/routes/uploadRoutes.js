import { Router } from "express";
import { getImage, uploadImage } from "../controllers/uploadController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:id", getImage);
router.post("/", protect, authorize("admin"), uploadImage);

export default router;
