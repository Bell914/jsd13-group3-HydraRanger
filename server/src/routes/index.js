import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import { getDBStatus } from "../config/db.js";
import itemRoutes from "./itemRoutes.js";
import productRoutes from "./productRoutes.js";
import adminProductRoutes from "./adminProductRoutes.js";
import adminDashboardRoutes from "./adminDashboardRoutes.js";
import adminAuthRoutes from "./adminAuthRoutes.js";
import orderRoutes from "./orderRoutes.js";
import adminOrderRoutes from "./adminOrderRoutes.js";
import adminCustomerRoutes from "./adminCustomerRoutes.js";
import contactRoutes from "./contact.route.js";
import lookbookRoutes from "./lookbookRoutes.js";
import adminLookbookRoutes from "./adminLookbookRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import recommendRoutes from "./recommendRoutes.js";
import couponRoutes from "./couponRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import articleRoutes from "./articleRoutes.js";
import adminArticleRoutes from "./adminArticleRoutes.js";
import adminCouponRoutes from "./adminCouponRoutes.js";

const router = Router();

// API base endpoint
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OCCASION API Server (Sprint 2)",
    health: "/api/health",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      products: "/api/products",
      lookbooks: "/api/lookbooks",
      articles: "/api/articles",
      users: "/api/users",
      orders: "/api/orders",
      coupons: "/api/coupons",
    },
  });
});

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
router.use("/orders", orderRoutes);
router.use("/payment", paymentRoutes);
router.use("/admin/orders", adminOrderRoutes);
router.use("/admin/customers", adminCustomerRoutes);
router.use("/contact", contactRoutes);
router.use("/lookbooks", lookbookRoutes);
router.use("/admin/lookbooks", adminLookbookRoutes);
router.use("/uploads", uploadRoutes);
router.use("/recommend", recommendRoutes);
router.use("/coupons", couponRoutes);
router.use("/articles", articleRoutes);
router.use("/admin/articles", adminArticleRoutes);
router.use("/admin/coupons", adminCouponRoutes);

export default router;
