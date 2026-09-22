import fallbackData from "../data/look-data.json";
import { API_URL } from "./api.js";

export function normalizeProductId(id) {
  if (id === undefined || id === null) return "";
  const str = String(id).trim();
  if (/^\d+$/.test(str)) {
    const num = Number(str);
    return num <= 5 ? `top-00${num}` : `bottom-00${num - 5}`;
  }
  return str;
}

function normalizeItem(item) {
  const product = item.product || {};
  const variants = product.variants || [];
  const selectedVariant =
    variants.find((variant) => {
      return variant.sku === item.defaultVariantSku;
    }) ||
    variants[0] ||
    {};

  const rawId = product.productId || product._id || item.productId;
  const productId = normalizeProductId(rawId);

  return {
    productId,
    sku: selectedVariant.sku || item.defaultVariantSku || item.sku,
    name: product.title || product.name || item.name || "Product",
    color:
      selectedVariant.color ||
      selectedVariant.size_or_color ||
      item.color ||
      "Standard",
    sizes:
      variants
        .map((variant) => variant.size || variant.size_or_color)
        .filter(Boolean).length > 0
        ? variants
            .map((variant) => variant.size || variant.size_or_color)
            .filter(Boolean)
        : item.sizes || ["S", "M", "L"],
    price: selectedVariant.price || item.price || 0,
    image:
      selectedVariant.imageUrl ||
      product.imageUrl ||
      product.images?.[0]?.image_url ||
      item.image ||
      "",
  };
}

function normalizeLookbook(lookbook) {
  return {
    ...lookbook,
    id: lookbook.lookbookId || lookbook.id,
    image: lookbook.imageUrl || lookbook.image,
    items: (lookbook.items || []).map(normalizeItem),
  };
}

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(result.message || "โหลดข้อมูล Lookbook ไม่สำเร็จ");
    error.status = response.status;
    throw error;
  }

  return result.data;
}

export async function getLookbookData() {
  try {
    const lookbooks = await request("/lookbooks");
    return {
      collection: fallbackData.collection,
      looks: lookbooks.map(normalizeLookbook),
    };
  } catch (error) {
    console.warn("Lookbook API unavailable, using local data:", error.message);
    return {
      collection: fallbackData.collection,
      looks: (fallbackData.looks || []).map(normalizeLookbook),
    };
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
  return data.looks || [];
}

export async function getLookbookById(lookId) {
  try {
    const lookbook = await request(`/lookbooks/${lookId}`);
    return normalizeLookbook(lookbook);
  } catch (error) {
    if (error.status === 404) return null;
    console.warn(
      "Lookbook detail API unavailable, using local data:",
      error.message,
    );
    const target = String(lookId).trim().toLowerCase();
    const found = fallbackData.looks.find((lookbook) => {
      const id = String(lookbook.id || "").toLowerCase();
      const name = String(lookbook.name || "")
        .toLowerCase()
        .replace(/\s+/g, "-");
      return (
        id === target || name === target || id.replace("look-", "") === target
      );
    });
    return found ? normalizeLookbook(found) : null;
  }
}

export function getProductDetailUrl(productId) {
  if (!productId) return "/products";
  const resolved = normalizeProductId(productId);
  return `/products/${resolved}`;
}
