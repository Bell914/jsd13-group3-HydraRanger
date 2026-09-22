import { Router } from "express";
import { uploadImage } from "../controllers/uploadController.js";

const router = Router();

router.post("/", uploadImage);

export default router;