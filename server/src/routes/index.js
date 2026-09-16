import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import { getDBStatus } from "../config/db.js";
import itemRoutes from "./itemRoutes.js";
import productRoutes from "./productRoutes.js";
import adminProductRoutes from "./adminProductRoutes.js";
import adminDashboardRoutes from "./adminDashboardRoutes.js";
import adminAuthRoutes from "./adminAuthRoutes.js";
const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    status: "online",
    timestamp: new Date().toISOString(),
    service: "OCCASION API Server (Sprint 2)",
    database: getDBStatus(),
  });
});

// Sub-routes mounting
router.use("/auth", authRoutes);
router.use("/admin/auth", adminAuthRoutes);
router.use("/users", userRoutes);
router.use("/items", itemRoutes);
router.use("/products", productRoutes);
router.use("/admin/products", adminProductRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);

export default router;
