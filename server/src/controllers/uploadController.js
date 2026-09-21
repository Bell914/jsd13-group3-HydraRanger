import { uploadSingleImage, MAX_FILE_SIZE } from "../middleware/uploadMiddleware.js";
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
  uploadSingleImage(req, res, (err) => {
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

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "อัปโหลดรูปภาพสำเร็จ",
      data: {
        url: `/collection-2026/mixandmatch/${req.file.filename}`,
        filename: req.file.filename,
      },
    });
  });
}