import multer from 'multer';

export const MAX_RECOMMEND_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RECOMMEND_IMAGE_SIZE, files: 2, fields: 0, parts: 2 },
  fileFilter(req, file, callback) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return callback(new Error('รองรับเฉพาะไฟล์ JPG, PNG, WebP และ GIF'));
    }
    callback(null, true);
  }
}).fields([{ name: 'top', maxCount: 1 }, { name: 'bottom', maxCount: 1 }]);

function matchesImageHeader(file) {
  const buffer = file.buffer;
  if (file.mimetype === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
  }
  if (file.mimetype === 'image/png') {
    return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (file.mimetype === 'image/webp') {
    return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  const header = buffer.toString('ascii', 0, 6);
  return header === 'GIF87a' || header === 'GIF89a';
}

export function memoryUpload(req, res, next) {
  upload(req, res, (error) => {
    if (error) {
      const tooLarge = error.code === 'LIMIT_FILE_SIZE';
      return res.status(tooLarge ? 413 : 400).json({
        success: false,
        message: tooLarge ? 'รูปภาพต้องมีขนาดไม่เกิน 5 MB ต่อไฟล์' : 'ส่งรูป JPG, PNG, WebP หรือ GIF ได้ไม่เกิน 2 รูป (เสื้อและกางเกง)'
      });
    }

    const files = Object.values(req.files || {}).flat();
    if (files.some((file) => !matchesImageHeader(file))) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไฟล์ไม่ตรงกับชนิดรูปภาพที่ระบุ' });
    }
    next();
  });
}
