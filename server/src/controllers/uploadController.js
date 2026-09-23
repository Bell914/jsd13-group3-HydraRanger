import fs from "node:fs/promises";
import path from "node:path";
import {
  uploadSingleImage,
  MAX_FILE_SIZE,
  createUploadedImageName,
  matchesUploadedImageHeader,
  uploadsFolder,
} from "../middleware/uploadMiddleware.js";
import { HTTP_STATUS } from "../config/constants.js";

const MB = Math.round(MAX_FILE_SIZE / (1024 * 1024));

function getErrorMessage(err) {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return `ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${MB}MB)`;
  }
  if (err?.code === "LIMIT_UNEXPECTED_FILE") {
    return "ส่งมาได้เพียง 1 ไฟล์ต่อคำขอ";
  }
  return err?.message || "อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
}

export function uploadImage(req, res) {
  uploadSingleImage(req, res, async (err) => {
    if (err) {
      return res
        .status(err?.status || HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: getErrorMessage(err) });
    }

    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "กรุณาเลือกไฟล์รูปภาพ",
      });
    }

    if (!matchesUploadedImageHeader(req.file)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "ข้อมูลไฟล์ไม่ตรงกับชนิดรูปภาพที่ระบุ",
      });
    }

    const filename = createUploadedImageName(req.file.mimetype);
    try {
      await fs.writeFile(path.join(uploadsFolder, filename), req.file.buffer, { flag: "wx" });
    } catch {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR || 500).json({
        success: false,
        message: "บันทึกรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      });
    }

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "อัปโหลดรูปภาพสำเร็จ",
      data: {
        url: `/collection-2026/mixandmatch/${filename}`,
        filename,
      },
    });
  });
}
