import fallbackData from '../data/look-data.json';
import { API_URL } from './api.js';

function normalizeItem(item) {
  const product = item.product || {};
  const variants = product.variants || [];
  const selectedVariant = variants.find((variant) => {
    return variant.sku === item.defaultVariantSku;
  }) || variants[0] || {};

  return {
    productId: product.productId || product._id,
    sku: selectedVariant.sku || item.defaultVariantSku,
    name: product.title || product.name || 'Product',
    color: selectedVariant.color || selectedVariant.size_or_color || 'Standard',
    sizes: variants.map((variant) => variant.size || variant.size_or_color).filter(Boolean),
    price: selectedVariant.price || 0,
    image: selectedVariant.imageUrl || product.imageUrl || product.images?.[0]?.image_url || '',
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
    const error = new Error(result.message || 'โหลดข้อมูล Lookbook ไม่สำเร็จ');
    error.status = response.status;
    throw error;
  }

  return result.data;
}

export async function getLookbookData() {
  try {
    const lookbooks = await request('/lookbooks');
    return {
      collection: fallbackData.collection,
      looks: lookbooks.map(normalizeLookbook),
    };
  } catch (error) {
    console.warn('Lookbook API unavailable, using local data:', error.message);
    return fallbackData;
  }
}

export async function getLookbooks() {
  const data = await getLookbookData();
  return data.looks || [];
}

export async function getLookbookById(lookId) {
  try {
    const lookbook = await request(`/lookbooks/${lookId}`);
    return normalizeLookbook(lookbook);
  } catch (error) {
    if (error.status === 404) return null;
    console.warn('Lookbook detail API unavailable, using local data:', error.message);
    const target = String(lookId).trim().toLowerCase();
    return fallbackData.looks.find((lookbook) => {
      const id = String(lookbook.id || '').toLowerCase();
      const name = String(lookbook.name || '').toLowerCase().replace(/\s+/g, '-');
      return id === target || name === target || id.replace('look-', '') === target;
    }) || null;
  }
}

export function getProductDetailUrl(productId) {
  return `/products/${productId}`;
}
