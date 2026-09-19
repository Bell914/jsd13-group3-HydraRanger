import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ENV } from "./config/env.js";
import apiRouter from "./routes/index.js";
import {
  requestLogger,
  notFoundHandler,
  errorHandler,
} from "./middleware/index.js";

const app = express();
const currentFilePath = fileURLToPath(import.meta.url);
const currentFolderPath = path.dirname(currentFilePath);
const productImageFolder = path.resolve(
  currentFolderPath,
  "../../client/public/collection-2026",
);

const allowedOrigins = [
  ENV.CLIENT_URL?.replace(/\/+$/, ""),
  ENV.ADMIN_CLIENT_URL?.replace(/\/+$/, ""),
].filter(Boolean);

if (ENV.NODE_ENV === "development") {
  allowedOrigins.push(
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://localhost:5176",
  );
}

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
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, "");
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith(".vercel.app") ||
        cleanOrigin.includes("vercel.app") ||
        cleanOrigin.includes("localhost") ||
        cleanOrigin.includes("127.0.0.1") ||
        cleanOrigin.includes("onrender.com");

      if (isAllowed) {
        return callback(null, true);
      }
      // Allow all origins during Sprint 2 demo to prevent blocking
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Let the Admin website display the same product images as the customer website.
app.use("/collection-2026", express.static(productImageFolder));

if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(requestLogger);

// Root Welcome Endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to OCCASION API (HydraRanger Team - Sprint 2)",
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
