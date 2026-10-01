import {
  uploadSingleImage,
  MAX_FILE_SIZE,
  matchesUploadedImageHeader,
} from "../middleware/uploadMiddleware.js";
import { HTTP_STATUS } from "../config/constants.js";
import { openImageDownload, storeImage } from "../services/imageStorageService.js";

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

    let storedImage;
    try {
      storedImage = await storeImage(req.file);
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR || 500).json({
        success: false,
        message: error.message || "บันทึกรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      });
    }

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "อัปโหลดรูปภาพสำเร็จ",
      data: {
        url: `/api/uploads/${storedImage.id}`,
        filename: storedImage.filename,
      },
    });
  });
}

export async function getImage(req, res, next) {
  try {
    const image = await openImageDownload(req.params.id);
    if (!image) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Image not found' });
    res.set('Content-Type', image.file.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    image.stream.on('error', next);
    image.stream.pipe(res);
  } catch (error) {
    next(error);
  }
}
