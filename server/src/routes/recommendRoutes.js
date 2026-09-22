import { Router } from "express";
import { recommendLookbooks, memoryUpload } from "../controllers/recommendController.js";

const router = Router();

router.post("/", memoryUpload, recommendLookbooks);

export default router;