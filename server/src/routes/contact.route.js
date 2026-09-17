import express from "express";
import { submitContactForm } from "../controllers/contact.controller.js";

const router = express.Router();

// ✅ ใช้ "/" ได้เลย (เมื่อรวมกับไฟล์หลักจะได้เป็น POST /contact พอดี)
router.post("/", submitContactForm);

export default router;
