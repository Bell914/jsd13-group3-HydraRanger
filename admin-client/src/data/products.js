// Temporary admin copy of the Sprint 2 product fallback data.
// Replace this module with /api/products when the Product API is available.
export const products = [
  {
    _id: 'top-001',
    productId: 'top-001',
    name: 'Oversized T-Shirt',
    description: 'เสื้อยืดคอตตอนทรง Relaxed Oversized สไตล์เรียบง่าย สวมใส่สบายได้ทุกโอกาส',
    category: 'tops',
    gender: 'unisex',
    tags: ['casual', 'minimal', 'relaxed'],
    imageUrl: '/collection-2026/products/top-01-off-white.png',
    variants: [
      { _id: 'top-001-ow-s', sku: 'TOP-001-OW-S', color: 'Off White', colorCode: 'OW', size: 'S', price: 590, stockQuantity: 15 },
      { _id: 'top-001-ow-m', sku: 'TOP-001-OW-M', color: 'Off White', colorCode: 'OW', size: 'M', price: 590, stockQuantity: 12 },
      { _id: 'top-001-ow-l', sku: 'TOP-001-OW-L', color: 'Off White', colorCode: 'OW', size: 'L', price: 590, stockQuantity: 8 },
      { _id: 'top-001-ch-s', sku: 'TOP-001-CH-S', color: 'Charcoal', colorCode: 'CH', size: 'S', price: 590, stockQuantity: 10 },
      { _id: 'top-001-ch-m', sku: 'TOP-001-CH-M', color: 'Charcoal', colorCode: 'CH', size: 'M', price: 590, stockQuantity: 14 },
      { _id: 'top-001-ch-l', sku: 'TOP-001-CH-L', color: 'Charcoal', colorCode: 'CH', size: 'L', price: 590, stockQuantity: 6 },
    ],
  },
  {
    _id: 'top-002',
    productId: 'top-002',
    name: 'Classic Linen Shirt',
    description: 'เสื้อเชิ้ตลินินทรง Oversized โปร่งเบา สำหรับลุค Casual และ Minimal',
    category: 'tops',
    gender: 'unisex',
    tags: ['classic', 'casual', 'linen'],
    imageUrl: '/collection-2026/products/top-02-white.png',
    variants: [
      { _id: 'top-002-wh-s', sku: 'TOP-002-WH-S', color: 'White', colorCode: 'WH', size: 'S', price: 790, stockQuantity: 10 },
      { _id: 'top-002-wh-m', sku: 'TOP-002-WH-M', color: 'White', colorCode: 'WH', size: 'M', price: 790, stockQuantity: 8 },
      { _id: 'top-002-wh-l', sku: 'TOP-002-WH-L', color: 'White', colorCode: 'WH', size: 'L', price: 790, stockQuantity: 5 },
      { _id: 'top-002-sb-s', sku: 'TOP-002-SB-S', color: 'Sky Blue', colorCode: 'SB', size: 'S', price: 790, stockQuantity: 7 },
    ],
  },
];
