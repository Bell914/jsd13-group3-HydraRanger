/**
 * Lookbook Service
 * Fetches lookbook data from API or /collection-2026/look-data.json
 */
import fallbackData from "../data/look-data.json";
import api from "./api";

export async function getLookbookData() {
  try {
    const res = await fetch("/collection-2026/look-data.json");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("fetch /collection-2026/look-data.json failed, checking fallback:", error.message);
    if (fallbackData && fallbackData.looks) {
      return fallbackData;
    }
    throw error;
  }
}

export async function getLookbooks() {
  try {
    // พยายามดึงจาก Backend API ก่อน
    const response = await api.get("/lookbooks");
    if (response.data && response.data.data) {
      return response.data.data;
    }
  } catch (err) {
    console.warn("API /lookbooks failed, falling back to local JSON data:", err.message);
  }

  // Fallback ไปใช้ไฟล์ JSON เดิม
  const data = await getLookbookData();
  return data?.looks || [];
}

export async function getLookbookById(lookId) {
  try {
    const response = await api.get(`/lookbooks/${lookId}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
  } catch (err) {
    console.warn(`API /lookbooks/${lookId} failed, falling back to local JSON data:`, err.message);
  }

  // Fallback ไปใช้ไฟล์ JSON เดิม
  const data = await getLookbookData();
  const looks = data?.looks || [];
  const target = String(lookId).trim().toLowerCase();

  return (
    looks.find((item) => {
      const id = String(item.id || "").toLowerCase();
      const name = String(item.name || "").toLowerCase().replace(/\s+/g, "-");
      return id === target || name === target || id.replace("look-", "") === target;
    }) || null
  );
}

/**
 * เพิ่ม / ยกเลิก บันทึก Lookbook โปรด (Toggle Favorite API)
 */
export async function toggleFavoriteLookbook(lookbookId) {
  const response = await api.post(`/lookbooks/${lookbookId}/favorite`);
  return response.data;
}

/**
 * Maps productId from look-data.json (1-10) to product slug / id
 * 1..5 -> top-001..top-005
 * 6..10 -> bottom-001..bottom-005
 */
export function getProductDetailUrl(productId) {
  const num = Number(productId);
  if (!isNaN(num) && num >= 1 && num <= 10) {
    if (num <= 5) {
      return `/products/top-00${num}`;
    }
    return `/products/bottom-00${num - 5}`;
  }
  return `/products/${productId}`;
}