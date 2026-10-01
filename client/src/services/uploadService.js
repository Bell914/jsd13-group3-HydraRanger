import { API_URL } from "./api.js";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(result.message || "อัปโหลดรูปภาพไม่สำเร็จ");
    error.status = response.status;
    throw error;
  }

  return result.data?.url || result.url;
}