const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const TOP_MEASUREMENTS = {
  XS: 88,
  S: 96,
  M: 104,
  L: 112,
  XL: 120,
  XXL: 128
};

const BOTTOM_MEASUREMENTS = {
  XS: { waist: 70, hips: 92 },
  S: { waist: 78, hips: 100 },
  M: { waist: 86, hips: 108 },
  L: { waist: 94, hips: 116 },
  XL: { waist: 102, hips: 124 },
  XXL: { waist: 110, hips: 132 }
};

function getCategory(product) {
  return product.category_id?.slug || product.category?.slug || product.category || '';
}

function getProductSizes(product) {
  const sizes = (product.variants || [])
    .map((variant) => variant.size || variant.size_or_color)
    .filter(Boolean);

  return SIZE_ORDER.filter((size) => sizes.includes(size));
}

export function buildDefaultSizeChart(product) {
  const sizes = getProductSizes(product);
  const category = getCategory(product);

  if (category === 'bottoms') {
    return sizes.map((size) => ({
      size_name: size,
      garment_waist_actual: BOTTOM_MEASUREMENTS[size].waist,
      garment_hips_actual: BOTTOM_MEASUREMENTS[size].hips
    }));
  }

  if (category !== 'tops') return [];

  return sizes.map((size) => ({
    size_name: size,
    garment_chest_actual: TOP_MEASUREMENTS[size]
  }));
}
