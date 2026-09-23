import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
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

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  const error = new Error("รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP, GIF)");
  error.status = 400;
  cb(error);
};

export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("file");

export function matchesUploadedImageHeader(file) {
  const buffer = file?.buffer;
  if (!buffer) return false;
  if (file.mimetype === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
  }
  if (file.mimetype === "image/png") {
    return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (file.mimetype === "image/webp") {
    return buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  }
  const header = buffer.toString("ascii", 0, 6);
  return header === "GIF87a" || header === "GIF89a";
}

export function createUploadedImageName(mimetype) {
  const extensions = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  return `mixmatch-${randomUUID()}${extensions[mimetype]}`;
}

export { MAX_FILE_SIZE };
