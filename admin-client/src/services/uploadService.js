const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

export async function uploadProductImage(file) {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    credentials: 'include',
    body: form
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'อัปโหลดรูปไม่สำเร็จ');
  return result.data.url;
}

export const uploadArticleImage = uploadProductImage;
