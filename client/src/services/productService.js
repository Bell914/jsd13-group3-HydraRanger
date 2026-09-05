import { api } from "./api.js";

// Fallback products in case backend is loading/connecting
const fallbackProducts = [
  {
    _id: "top-001",
    productId: "top-001",
    name: "Oversized T-Shirt",
    description: "เสื้อยืดคอตตอนทรง Relaxed Oversized สไตล์เรียบง่าย สวมใส่สบายได้ทุกโอกาส",
    category: "tops",
    gender: "unisex",
    tags: ["casual", "minimal", "relaxed"],
    imageUrl: "/collection-2026/products/top-01-off-white.png",
    variants: [
      {
        _id: "top-001-ow-s",
        sku: "TOP-001-OW-S",
        color: "Off White",
        colorCode: "OW",
        size: "S",
        price: 590,
        stockQuantity: 15,
        imageUrl: "/collection-2026/products/top-01-off-white.png",
      },
      {
        _id: "top-001-ow-m",
        sku: "TOP-001-OW-M",
        color: "Off White",
        colorCode: "OW",
        size: "M",
        price: 590,
        stockQuantity: 12,
        imageUrl: "/collection-2026/products/top-01-off-white.png",
      },
      {
        _id: "top-001-ow-l",
        sku: "TOP-001-OW-L",
        color: "Off White",
        colorCode: "OW",
        size: "L",
        price: 590,
        stockQuantity: 8,
        imageUrl: "/collection-2026/products/top-01-off-white.png",
      },
      {
        _id: "top-001-ch-s",
        sku: "TOP-001-CH-S",
        color: "Charcoal",
        colorCode: "CH",
        size: "S",
        price: 590,
        stockQuantity: 10,
        imageUrl: "/collection-2026/products/top-01-charcoal.png",
      },
      {
        _id: "top-001-ch-m",
        sku: "TOP-001-CH-M",
        color: "Charcoal",
        colorCode: "CH",
        size: "M",
        price: 590,
        stockQuantity: 14,
        imageUrl: "/collection-2026/products/top-01-charcoal.png",
      },
      {
        _id: "top-001-ch-l",
        sku: "TOP-001-CH-L",
        color: "Charcoal",
        colorCode: "CH",
        size: "L",
        price: 590,
        stockQuantity: 6,
        imageUrl: "/collection-2026/products/top-01-charcoal.png",
      },
    ],
  },
  {
    _id: "top-002",
    productId: "top-002",
    name: "Classic Linen Shirt",
    description: "เสื้อเชิ้ตลินินทรง Oversized โปร่งเบา สำหรับลุค Casual และ Minimal",
    category: "tops",
    gender: "unisex",
    tags: ["classic", "casual", "linen"],
    imageUrl: "/collection-2026/products/top-02-white.png",
    variants: [
      {
        _id: "top-002-wh-s",
        sku: "TOP-002-WH-S",
        color: "White",
        colorCode: "WH",
        size: "S",
        price: 790,
        stockQuantity: 10,
        imageUrl: "/collection-2026/products/top-02-white.png",
      },
      {
        _id: "top-002-wh-m",
        sku: "TOP-002-WH-M",
        color: "White",
        colorCode: "WH",
        size: "M",
        price: 790,
        stockQuantity: 8,
        imageUrl: "/collection-2026/products/top-02-white.png",
      },
      {
        _id: "top-002-wh-l",
        sku: "TOP-002-WH-L",
        color: "White",
        colorCode: "WH",
        size: "L",
        price: 790,
        stockQuantity: 5,
        imageUrl: "/collection-2026/products/top-02-white.png",
      },
      {
        _id: "top-002-sb-s",
        sku: "TOP-002-SB-S",
        color: "Sky Blue",
        colorCode: "SB",
        size: "S",
        price: 790,
        stockQuantity: 7,
        imageUrl: "/collection-2026/products/top-02-sky-blue.png",
      },
    ],
  },
];

/**
 * Fetch products from MongoDB via backend API
 * @param {Object} params - Query params (category, search, gender)
 * @returns {Promise<Array>} List of products
 */
export async function getProducts(params = {}) {
  try {
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
    const response = await api.get(`/products${queryString}`);

    if (response && response.data) {
      return response.data;
    }
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.warn("API error fetching products from MongoDB, using fallback:", error.message);
    let filtered = [...fallbackProducts];
    if (params.category && params.category !== "all") {
      filtered = filtered.filter((p) => p.category === params.category);
    }
    if (params.search) {
      const term = params.search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(term));
    }
    return filtered;
  }
}

/**
 * Fetch single product by ID from MongoDB via backend API
 * @param {string} productId - Product ID (_id or slug)
 * @returns {Promise<Object|null>} Product object
 */
export async function getProductById(productId) {
  try {
    const response = await api.get(`/products/${productId}`);
    if (response && response.data) {
      return response.data;
    }
    return response || null;
  } catch (error) {
    console.warn("API error fetching product by ID from MongoDB, using fallback:", error.message);
    return (
      fallbackProducts.find(
        (product) =>
          product._id === productId || product.productId === productId
      ) || null
    );
  }
}