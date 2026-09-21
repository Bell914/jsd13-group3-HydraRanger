const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://jsd13-group3-hydraranger.onrender.com/api";

const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const BASE_URL = cleanBaseUrl.endsWith("/api")
  ? cleanBaseUrl
  : `${cleanBaseUrl}/api`;

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/uploads`, {
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