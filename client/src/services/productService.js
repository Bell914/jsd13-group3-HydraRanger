import { api, getApiBaseUrl } from "./api.js";

function resolveProductImageUrl(url) {
  if (!url || url.startsWith('http') || !url.startsWith('/api/uploads/')) return url;
  return `${getApiBaseUrl().replace(/\/api\/?$/, '')}${url}`;
}

// Fallback products in case backend is loading/connecting
const fallbackProducts = [
  {
    _id: "top-001",
    productId: "top-001",
    name: "เสื้อยืดคอตตอนทรง Relaxed",
    description: "เสื้อยืดคอตตอนทรง Relaxed Oversized สไตล์เรียบง่าย สวมใส่สบายได้ทุกโอกาส",
    category: "tops",
    gender: "unisex",
    tags: ["casual", "minimal", "relaxed"],
    imageUrl: "/collection-2026/all-images/top-01-off-white.png",
    variants: [
      {
        _id: "top-001-ow-s",
        sku: "TOP-001-OW-S",
        color: "Off White",
        colorCode: "OW",
        size: "S",
        price: 590,
        stockQuantity: 15,
        imageUrl: "/collection-2026/all-images/top-01-off-white.png",
      },
      {
        _id: "top-001-ow-m",
        sku: "TOP-001-OW-M",
        color: "Off White",
        colorCode: "OW",
        size: "M",
        price: 590,
        stockQuantity: 12,
        imageUrl: "/collection-2026/all-images/top-01-off-white.png",
      },
      {
        _id: "top-001-ow-l",
        sku: "TOP-001-OW-L",
        color: "Off White",
        colorCode: "OW",
        size: "L",
        price: 590,
        stockQuantity: 8,
        imageUrl: "/collection-2026/all-images/top-01-off-white.png",
      },
      {
        _id: "top-001-ch-s",
        sku: "TOP-001-CH-S",
        color: "Charcoal",
        colorCode: "CH",
        size: "S",
        price: 590,
        stockQuantity: 10,
        imageUrl: "/collection-2026/all-images/top-01-charcoal.png",
      },
    ],
  },
  {
    _id: "top-002",
    productId: "top-002",
    name: "เสื้อเชิ้ตลินิน Oversized",
    description: "เสื้อเชิ้ตลินินทรง Oversized โปร่งเบา สำหรับลุค Casual และ Minimal",
    category: "tops",
    gender: "unisex",
    tags: ["classic", "casual", "linen"],
    imageUrl: "/collection-2026/all-images/top-02-white.png",
    variants: [
      {
        _id: "top-002-wh-s",
        sku: "TOP-002-WH-S",
        color: "White",
        colorCode: "WH",
        size: "S",
        price: 790,
        stockQuantity: 10,
        imageUrl: "/collection-2026/all-images/top-02-white.png",
      },
      {
        _id: "top-002-sb-s",
        sku: "TOP-002-SB-S",
        color: "Sky Blue",
        colorCode: "SB",
        size: "S",
        price: 790,
        stockQuantity: 7,
        imageUrl: "/collection-2026/all-images/top-02-sky-blue.png",
      },
    ],
  },
  {
    _id: "top-003",
    productId: "top-003",
    name: "เสื้อโปโลผ้าถัก Compact Knit",
    description: "เสื้อโปโลผ้าถักเนื้อละเอียด ให้สัมผัสนุ่มสบาย สไตล์เรโทรร่วมสมัย",
    category: "tops",
    gender: "unisex",
    tags: ["smart-casual", "retro", "knit"],
    imageUrl: "/collection-2026/all-images/top-03-forest.png",
    variants: [
      {
        _id: "top-003-fg-s",
        sku: "TOP-003-FG-S",
        color: "Forest Green",
        colorCode: "FG",
        size: "S",
        price: 690,
        stockQuantity: 14,
        imageUrl: "/collection-2026/all-images/top-03-forest.png",
      },
      {
        _id: "top-003-sd-s",
        sku: "TOP-003-SD-S",
        color: "Sand",
        colorCode: "SD",
        size: "S",
        price: 690,
        stockQuantity: 9,
        imageUrl: "/collection-2026/all-images/top-03-sand.png",
      },
    ],
  },
  {
    _id: "top-004",
    productId: "top-004",
    name: "เสื้อคลุม Utility Overshirt",
    description: "เสื้อคลุมอเนกประสงค์ มีกระเป๋าหน้า เหมาะสำหรับการแต่งตัวแบบ Layering",
    category: "tops",
    gender: "unisex",
    tags: ["utility", "layering", "jacket"],
    imageUrl: "/collection-2026/all-images/top-04-navy.png",
    variants: [
      {
        _id: "top-004-nv-s",
        sku: "TOP-004-NV-S",
        color: "Navy",
        colorCode: "NV",
        size: "S",
        price: 990,
        stockQuantity: 12,
        imageUrl: "/collection-2026/all-images/top-04-navy.png",
      },
      {
        _id: "top-004-ol-s",
        sku: "TOP-004-OL-S",
        color: "Olive",
        colorCode: "OL",
        size: "S",
        price: 990,
        stockQuantity: 8,
        imageUrl: "/collection-2026/all-images/top-04-olive.png",
      },
    ],
  },
  {
    _id: "top-005",
    productId: "top-005",
    name: "เสื้อแขนยาวลายทาง Breton",
    description: "เสื้อยืดแขนยาวลายทางคลาสสิก ผ้าคอตตอน 100% สไตล์มินิมอลสบายตา",
    category: "tops",
    gender: "unisex",
    tags: ["casual", "stripes", "nautical"],
    imageUrl: "/collection-2026/all-images/top-05-navy-stripe.png",
    variants: [
      {
        _id: "top-005-ns-s",
        sku: "TOP-005-NS-S",
        color: "Navy Stripe",
        colorCode: "NS",
        size: "S",
        price: 590,
        stockQuantity: 16,
        imageUrl: "/collection-2026/all-images/top-05-navy-stripe.png",
      },
      {
        _id: "top-005-rs-s",
        sku: "TOP-005-RS-S",
        color: "Red Stripe",
        colorCode: "RS",
        size: "S",
        price: 590,
        stockQuantity: 11,
        imageUrl: "/collection-2026/all-images/top-05-red-stripe.png",
      },
    ],
  },
  {
    _id: "bottom-001",
    productId: "bottom-001",
    name: "กางเกงยีนส์ทรงตรง Relaxed",
    description: "กางเกงยีนส์ฟอกนุ่ม ทรงตรงใส่สบาย เข้ากับเสื้อยืดและเสื้อเชิ้ตได้ทุกลุค",
    category: "bottoms",
    gender: "unisex",
    tags: ["denim", "relaxed", "classic"],
    imageUrl: "/collection-2026/all-images/bottom-01-indigo.png",
    variants: [
      {
        _id: "bottom-001-in-s",
        sku: "BOT-001-IN-S",
        color: "Medium Indigo",
        colorCode: "IN",
        size: "S",
        price: 990,
        stockQuantity: 15,
        imageUrl: "/collection-2026/all-images/bottom-01-indigo.png",
      },
      {
        _id: "bottom-001-bk-s",
        sku: "BOT-001-BK-S",
        color: "Washed Black",
        colorCode: "BK",
        size: "S",
        price: 990,
        stockQuantity: 10,
        imageUrl: "/collection-2026/all-images/bottom-01-black.png",
      },
    ],
  },
  {
    _id: "bottom-002",
    productId: "bottom-002",
    name: "กางเกง Easy Pleated ขากว้าง",
    description: "กางเกงสแล็คมีจีบหน้า ทรงขากว้างทิ้งตัวสวย ให้ลุคกึ่งทางการที่ดูผ่อนคลาย",
    category: "bottoms",
    gender: "unisex",
    tags: ["smart-casual", "pleated", "minimal"],
    imageUrl: "/collection-2026/all-images/bottom-02-taupe.png",
    variants: [
      {
        _id: "bottom-002-tp-s",
        sku: "BOT-002-TP-S",
        color: "Warm Taupe",
        colorCode: "TP",
        size: "S",
        price: 890,
        stockQuantity: 12,
        imageUrl: "/collection-2026/all-images/bottom-02-taupe.png",
      },
      {
        _id: "bottom-002-ch-s",
        sku: "BOT-002-CH-S",
        color: "Charcoal",
        colorCode: "CH",
        size: "S",
        price: 890,
        stockQuantity: 9,
        imageUrl: "/collection-2026/all-images/bottom-02-charcoal.png",
      },
    ],
  },
  {
    _id: "bottom-003",
    productId: "bottom-003",
    name: "กางเกง Utility Cargo ทรง Tapered",
    description: "กางเกงคาร์โก้ผ้าคอตตอนริปสต็อป มีกระเป๋าข้างจุของได้เยอะ ทรงกระชับข้อเท้า",
    category: "bottoms",
    gender: "unisex",
    tags: ["cargo", "utility", "street"],
    imageUrl: "/collection-2026/all-images/bottom-03-olive.png",
    variants: [
      {
        _id: "bottom-003-ol-s",
        sku: "BOT-003-OL-S",
        color: "Muted Olive",
        colorCode: "OL",
        size: "S",
        price: 990,
        stockQuantity: 14,
        imageUrl: "/collection-2026/all-images/bottom-03-olive.png",
      },
      {
        _id: "bottom-003-bk-s",
        sku: "BOT-003-BK-S",
        color: "Matte Black",
        colorCode: "BK",
        size: "S",
        price: 990,
        stockQuantity: 11,
        imageUrl: "/collection-2026/all-images/bottom-03-black.png",
      },
    ],
  },
  {
    _id: "bottom-004",
    productId: "bottom-004",
    name: "กางเกงขาสั้น Nylon Easy",
    description: "กางเกงขาสั้นผ้าไนลอนเบาสบาย แห้งไว เหมาะกับวันหยุดและการท่องเที่ยว",
    category: "bottoms",
    gender: "unisex",
    tags: ["shorts", "summer", "lightweight"],
    imageUrl: "/collection-2026/all-images/bottom-04-navy.png",
    variants: [
      {
        _id: "bottom-004-nv-s",
        sku: "BOT-004-NV-S",
        color: "Deep Navy",
        colorCode: "NV",
        size: "S",
        price: 590,
        stockQuantity: 18,
        imageUrl: "/collection-2026/all-images/bottom-04-navy.png",
      },
      {
        _id: "bottom-004-tc-s",
        sku: "BOT-004-TC-S",
        color: "Terracotta",
        colorCode: "TC",
        size: "S",
        price: 590,
        stockQuantity: 8,
        imageUrl: "/collection-2026/all-images/bottom-04-terracotta.png",
      },
    ],
  },
  {
    _id: "bottom-005",
    productId: "bottom-005",
    name: "กางเกงวอร์ม Drawstring Fleece",
    description: "กางเกงวอร์มผ้าฟลีซสัมผัสนุ่ม มีเชือกรูดเอว ใส่สบายทั้งอยู่บ้านและออกไปข้างนอก",
    category: "bottoms",
    gender: "unisex",
    tags: ["sweatpants", "lounge", "comfort"],
    imageUrl: "/collection-2026/all-images/bottom-05-forest.png",
    variants: [
      {
        _id: "bottom-005-fg-s",
        sku: "BOT-005-FG-S",
        color: "Forest Green",
        colorCode: "FG",
        size: "S",
        price: 890,
        stockQuantity: 10,
        imageUrl: "/collection-2026/all-images/bottom-05-forest.png",
      },
      {
        _id: "bottom-005-gy-s",
        sku: "BOT-005-GY-S",
        color: "Heather Gray",
        colorCode: "GY",
        size: "S",
        price: 890,
        stockQuantity: 12,
        imageUrl: "/collection-2026/all-images/bottom-05-gray.png",
      },
    ],
  },
];


/**
 * Normalize product object from MongoDB to guarantee consistent properties for frontend
 * @param {Object} product
 * @returns {Object} Normalized product
 */
export function normalizeProduct(product) {
  if (!product) return null;
  const name = product.name || product.title || "";
  const category =
    product.category?.slug ||
    product.category_id?.slug ||
    product.category_id?.name ||
    product.category ||
    "";
  const imageUrl = resolveProductImageUrl(
    product.imageUrl ||
    product.images?.[0]?.image_url ||
    product.image ||
    product.variants?.[0]?.imageUrl ||
    ""
  );

  const variants = (product.variants || []).map((v) => {
    const color =
      v.color ||
      (v.size_or_color && !["S", "M", "L", "XL"].includes(v.size_or_color)
        ? v.size_or_color
        : "Standard");
    const size =
      v.size ||
      (["S", "M", "L", "XL"].includes(v.size_or_color) ? v.size_or_color : "S");
    return {
      ...v,
      _id: v._id || v.sku || `${product._id}-${color}-${size}`,
      sku: v.sku || `${product.productId || "PROD"}-${color}-${size}`,
      color,
      colorCode: v.colorCode || "",
      size,
      price: v.price ?? product.price ?? 590,
      stockQuantity: v.stockQuantity ?? v.stock_quantity ?? 10,
      imageUrl: resolveProductImageUrl(v.imageUrl || imageUrl),
      detailImages: (v.detailImages || []).map(resolveProductImageUrl),
    };
  });

  return {
    ...product,
    _id: product._id || product.productId,
    productId: product.productId || product._id,
    name,
    title: name,
    category,
    imageUrl,
    variants,
  };
}

/**
 * Fetch products from MongoDB via backend API
 * @param {Object} params - Query params (category, search, gender)
 * @returns {Promise<Array>} List of products
 */
export async function getProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== "all") {
    query.append("category", params.category);
  }
  if (params.search) {
    query.append("search", params.search);
  }
  if (params.gender && params.gender !== "all") {
    query.append("gender", params.gender);
  }

  const queryString = query.toString() ? `?${query.toString()}` : "";
  try {
    const response = await api.get(`/products${queryString}`);
    const list = response?.data || response;
    if (Array.isArray(list)) {
      return list.map(normalizeProduct);
    }
  } catch (err) {
    console.warn("Products API unavailable or error:", err.message);
    if (!import.meta.env.DEV && import.meta.env.MODE !== "test") {
      throw err;
    }
  }
  return fallbackProducts.map(normalizeProduct);
}

/**
 * Fetch single product by ID from MongoDB via backend API
 * @param {string} productId - Product ID (_id or slug)
 * @returns {Promise<Object|null>} Product object
 */
export async function getProductById(productId) {
  let resolvedId = productId;
  if (typeof productId === "number" || /^\d+$/.test(String(productId || "").trim())) {
    const num = Number(productId);
    resolvedId = num <= 5 ? `top-00${num}` : `bottom-00${num - 5}`;
  }

  try {
    const response = await api.get(`/products/${resolvedId}`);
    const item = response?.data || response;
    if (item && (item.title || item.name || item._id)) {
      return normalizeProduct(item);
    }
  } catch (err) {
    console.warn("Product API unavailable or error:", err.message);
    if (!import.meta.env.DEV && import.meta.env.MODE !== "test") {
      throw err;
    }
  }

  // Fallback to local fallbackProducts
  const target = String(resolvedId || "").toLowerCase();
  const fallback = fallbackProducts.find(
    (p) =>
      p._id?.toLowerCase() === target ||
      p.productId?.toLowerCase() === target ||
      p.variants?.some((v) => v.sku?.toLowerCase() === target)
  );
  return fallback ? normalizeProduct(fallback) : null;
}
