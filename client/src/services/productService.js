const products = [
  {
    _id: "top-001",
    name: "Oversized T-Shirt",
    description: "เสื้อยืดทรง Oversized สไตล์เรียบง่าย ใส่ได้ทุกโอกาส",
    category: "tops",
    gender: "unisex",
    tags: ["casual", "minimal"],
    imageUrl: "/collection-2026/products/top-01-off-white.png",

    variants: [
      {
        _id: "top-001-offwhite-s",
        sku: "TOP-001-OFF-S",
        color: "Off White",
        size: "S",
        price: 590,
        stockQuantity: 10,
      },
      {
        _id: "top-001-offwhite-m",
        sku: "TOP-001-OFF-M",
        color: "Off White",
        size: "M",
        price: 590,
        stockQuantity: 8,
      },
      {
        _id: "top-001-offwhite-l",
        sku: "TOP-001-OFF-L",
        color: "Off White",
        size: "L",
        price: 590,
        stockQuantity: 5,
      },
      {
        _id: "top-001-charcoal-s",
        sku: "TOP-001-CHA-S",
        color: "Charcoal",
        size: "S",
        price: 590,
        stockQuantity: 7,
      },
      {
        _id: "top-001-charcoal-m",
        sku: "TOP-001-CHA-M",
        color: "Charcoal",
        size: "M",
        price: 590,
        stockQuantity: 6,
      },
      {
        _id: "top-001-charcoal-l",
        sku: "TOP-001-CHA-L",
        color: "Charcoal",
        size: "L",
        price: 590,
        stockQuantity: 4,
      },
    ],
  },

  {
    _id: "top-002",
    name: "Classic Shirt",
    description: "เสื้อเชิ้ต Unisex สำหรับลุค Casual และ Minimal",
    category: "tops",
    gender: "unisex",
    tags: ["classic", "casual"],
    imageUrl: "/collection-2026/products/top-02-white.png",

    variants: [
      {
        _id: "top-002-white-s",
        color: "White",
        size: "S",
        price: 790,
        stockQuantity: 10,
      },
      {
        _id: "top-002-white-m",
        color: "White",
        size: "M",
        price: 790,
        stockQuantity: 8,
      },
      {
        _id: "top-002-white-l",
        color: "White",
        size: "L",
        price: 790,
        stockQuantity: 5,
      },
    ],
  },
];

export async function getProducts() {
  return products;
}

export async function getProductById(productId) {
  return products.find((product) => product._id === productId);
}