import express from "express";
import { submitContactForm } from "../controllers/contact.controller.js";
import { validate } from "../middleware/validatorMiddleware.js";
import { validateContactInput } from "../validators/contactValidator.js";

const router = express.Router();

// ✅ ใช้ "/" ได้เลย (เมื่อรวมกับไฟล์หลักจะได้เป็น POST /contact พอดี)
router.post("/", validate(validateContactInput), submitContactForm);

export default router;
