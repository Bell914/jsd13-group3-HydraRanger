import { adminRequest } from './adminApi.js';

export async function uploadProductImage(file) {
  const form = new FormData();
  form.append('file', file);
  const result = await adminRequest('/uploads', {
    method: 'POST',
    body: form,
    errorMessage: 'อัปโหลดรูปไม่สำเร็จ',
    networkMessage: 'อัปโหลดไฟล์ไม่ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่'
  });
  return result.data.url;
}

export const uploadArticleImage = uploadProductImage;
