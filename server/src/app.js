import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ENV } from "./config/env.js";
import { buildAllowedOrigins, isOriginAllowed } from "./config/security.js";
import apiRouter from "./routes/index.js";
import { stripeWebhook } from "./controllers/paymentController.js";
import {
  requestLogger,
  notFoundHandler,
  errorHandler,
} from "./middleware/index.js";

const app = express();
app.set("trust proxy", ENV.TRUST_PROXY);
const currentFilePath = fileURLToPath(import.meta.url);
const currentFolderPath = path.dirname(currentFilePath);
const productImageFolder = path.resolve(
  currentFolderPath,
  "../../client/public/collection-2026",
);

const allowedOrigins = buildAllowedOrigins(ENV);

// Global Middlewares
app.use(
  helmet({
    // Product images are served by the API and displayed by both websites.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin, allowedOrigins)) return callback(null, true);

      const error = new Error(`CORS blocked this origin: ${origin}`);
      error.status = 403;
      return callback(error);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Stripe signs the exact raw request bytes; this route must run before JSON parsing.
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Let the Admin website display the same product images as the customer website.
app.use("/collection-2026", express.static(productImageFolder));

if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(requestLogger);

// Root Welcome Endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to OCCASION API (HydraRanger Team - Sprint 3)",
    docs: "/api/health",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api", apiRouter);

// 404 & Error Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
