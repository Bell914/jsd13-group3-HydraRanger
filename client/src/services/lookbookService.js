/**
 * Lookbook Service
 * Fetches lookbook data from /collection-2026/look-data.json
 */
import fallbackData from "../data/look-data.json";

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
    // If running in environment where public URL is available, error is thrown or fallback is used
    if (fallbackData && fallbackData.looks) {
      return fallbackData;
    }
    throw error;
  }
}

export async function getLookbooks() {
  const data = await getLookbookData();
  return data?.looks || [];
}

export async function getLookbookById(lookId) {
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
