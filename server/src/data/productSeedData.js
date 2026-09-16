const sizes = ['S', 'M', 'L'];

const productDefinitions = [
  { productId: 'top-001', sku: 'TOP001', name: 'เสื้อยืดคอตตอนทรง Relaxed', category: 'tops', price: 490, colors: [['Off White', 'OW', 'off-white'], ['Charcoal', 'CH', 'charcoal']] },
  { productId: 'top-002', sku: 'TOP002', name: 'เสื้อเชิ้ตลินิน Oversized', category: 'tops', price: 790, colors: [['Sky Blue', 'SB', 'sky-blue'], ['White', 'WH', 'white']] },
  { productId: 'top-003', sku: 'TOP003', name: 'เสื้อโปโลผ้าถัก Compact Knit', category: 'tops', price: 690, colors: [['Forest Green', 'FG', 'forest'], ['Sand', 'SD', 'sand']] },
  { productId: 'top-004', sku: 'TOP004', name: 'เสื้อคลุม Utility Overshirt', category: 'tops', price: 990, colors: [['Navy', 'NV', 'navy'], ['Muted Olive', 'MO', 'olive']] },
  { productId: 'top-005', sku: 'TOP005', name: 'เสื้อแขนยาวลายทาง Breton', category: 'tops', price: 590, colors: [['Navy Stripe', 'NS', 'navy-stripe'], ['Red Stripe', 'RS', 'red-stripe']] },
  { productId: 'bottom-001', sku: 'BOT001', name: 'กางเกงยีนส์ทรงตรง Relaxed', category: 'bottoms', price: 990, colors: [['Washed Black', 'WB', 'black'], ['Medium Indigo', 'MI', 'indigo']] },
  { productId: 'bottom-002', sku: 'BOT002', name: 'กางเกง Easy Pleated ขากว้าง', category: 'bottoms', price: 890, colors: [['Charcoal', 'CH', 'charcoal'], ['Warm Taupe', 'WT', 'taupe']] },
  { productId: 'bottom-003', sku: 'BOT003', name: 'กางเกง Utility Cargo ทรง Tapered', category: 'bottoms', price: 990, colors: [['Matte Black', 'MB', 'black'], ['Muted Olive', 'MO', 'olive']] },
  { productId: 'bottom-004', sku: 'BOT004', name: 'กางเกงขาสั้น Nylon Easy', category: 'bottoms', price: 590, colors: [['Deep Navy', 'DN', 'navy'], ['Terracotta', 'TC', 'terracotta']] },
  { productId: 'bottom-005', sku: 'BOT005', name: 'กางเกง Jersey Jogger', category: 'bottoms', price: 690, colors: [['Forest Green', 'FG', 'forest'], ['Heather Gray', 'HG', 'gray']] }
];

function createVariants(product) {
  return product.colors.flatMap(([color, colorCode, fileColor]) => {
    return sizes.map((size, index) => {
      const fileName = `${product.productId.replace('bottom', 'bottom').replace('-00', '-0')}-${fileColor}`;
      return {
        sku: `${product.sku}-${colorCode}-${size}`,
        color,
        colorCode,
        size,
        price: product.price,
        stockQuantity: 12 - (index * 2),
        imageUrl: `/collection-2026/products/${fileName}.png`,
        detailImages: [
          `/collection-2026/product-detail/${fileName}-front.png`,
          `/collection-2026/product-detail/${fileName}-back.png`,
          `/collection-2026/product-detail/${fileName}-detail.png`
        ]
      };
    });
  });
}

export const productSeedData = productDefinitions.map((product) => {
  const variants = createVariants(product);
  return {
    productId: product.productId,
    name: product.name,
    description: `${product.name} จากคอลเลกชัน Everyday Play 2026`,
    category: product.category,
    gender: 'unisex',
    tags: ['everyday-play', 'minimal', 'unisex'],
    availableDate: new Date('2026-09-01'),
    imageUrl: variants[0].imageUrl,
    variants,
    isActive: true
  };
});
