import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentFolderPath = path.dirname(currentFilePath);
export const uploadsFolder = path.resolve(
  currentFolderPath,
  "../../../client/public/collection-2026/mixandmatch",
);

fs.mkdirSync(uploadsFolder, { recursive: true });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsFolder),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `mixmatch-${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  const error = new Error("รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP, GIF)");
  error.status = 400;
  cb(error);
};

export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("file");

export { MAX_FILE_SIZE };