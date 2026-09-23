import { BODY_SIZE_GUIDE, getProductCategory } from '../data/sizeGuide.js';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function getFitEase(preferredFit) {
  if (preferredFit === 'fitted') return 4;
  if (preferredFit === 'relaxed') return 12;
  return 8;
}

function getFitLabel(preferredFit) {
  if (preferredFit === 'fitted') return 'พอดีตัว';
  if (preferredFit === 'relaxed') return 'หลวมสบาย';
  return 'มาตรฐาน';
}

function noMatchingSize() {
  return {
    size: null,
    status: 'no-match',
    reason: 'ยังไม่มีไซส์ที่เหมาะกับสัดส่วนและทรงที่คุณเลือกตามข้อมูลที่มี กรุณาตรวจตารางไซส์หรือติดต่อร้าน'
  };
}

function getProductSizes(product, fallbackSizes) {
  const variants = product?.variants || [];
  // Use fallback sizes only when the product has no variant data.
  const sizes = variants.length > 0
    ? variants.map((variant) => variant.size || variant.size_or_color)
    : fallbackSizes;

  return SIZE_ORDER.filter((size) => sizes.includes(size));
}

function recommendFromProductChart(profile, product, sizes) {
  const category = getProductCategory(product);

  const chart = (product?.size_chart || product?.sizeChart || [])
    .map((item) => ({
      size: item.size_name || item.size,
      garmentChest: Number(item.garment_chest_actual ?? item.garmentChestActual ?? item.garmentChest),
      garmentWaist: Number(item.garment_waist_actual ?? item.garmentWaistActual ?? item.garmentWaist),
      garmentHips: Number(item.garment_hips_actual ?? item.garmentHipsActual ?? item.garmentHips)
    }))
    .filter((item) => sizes.includes(item.size));

  if (category === 'bottoms') {
    const usableChart = chart.filter((item) => (
      Number.isFinite(item.garmentWaist) && item.garmentWaist > 0 &&
      Number.isFinite(item.garmentHips) && item.garmentHips > 0
    )).sort((first, second) => (
      Math.max(first.garmentWaist, first.garmentHips) -
      Math.max(second.garmentWaist, second.garmentHips)
    ));
    if (usableChart.length === 0) return null;

    const ease = getFitEase(profile.preferredFit);
    const match = usableChart.find((item) => (
      item.garmentWaist >= Number(profile.waistCm) + ease &&
      item.garmentHips >= Number(profile.hipsCm) + ease
    ));
    if (!match) return noMatchingSize();

    return {
      size: match.size,
      confidence: 'ปานกลาง',
      source: 'ตารางรอบเอวและสะโพกของสินค้านี้',
      reason: `เทียบรอบเอว ${profile.waistCm} ซม. และรอบสะโพก ${profile.hipsCm} ซม. กับทรง ${getFitLabel(profile.preferredFit)}`
    };
  }

  const usableChart = chart
    .filter((item) => Number.isFinite(item.garmentChest) && item.garmentChest > 0)
    .sort((first, second) => first.garmentChest - second.garmentChest);
  if (usableChart.length === 0) return null;

  const targetChest = Number(profile.chestCm) + getFitEase(profile.preferredFit);
  const match = usableChart.find((item) => item.garmentChest >= targetChest);
  if (!match) return noMatchingSize();

  return {
    size: match.size,
    confidence: 'ปานกลาง',
    source: 'ตารางรอบอกของสินค้านี้',
    reason: `เทียบรอบอก ${profile.chestCm} ซม. กับทรง ${getFitLabel(profile.preferredFit)} ตารางนี้ยังไม่ยืนยันความพอดีของรอบเอว`
  };
}

function recommendFromMeasurements(profile, product, sizes) {
  const category = getProductCategory(product);
  let measurements = ['chest', 'waist', 'hips'];
  let measuredAreas = 'รอบอก รอบเอว และรอบสะโพก';

  if (category === 'tops') {
    measurements = ['chest', 'waist'];
    measuredAreas = 'รอบอกและรอบเอว';
  } else if (category === 'bottoms') {
    measurements = ['waist', 'hips'];
    measuredAreas = 'รอบเอวและรอบสะโพก';
  }

  for (const measurement of measurements) {
    const value = Number(profile[`${measurement}Cm`]);
    const smallest = BODY_SIZE_GUIDE[0][measurement].min;
    const largest = BODY_SIZE_GUIDE[BODY_SIZE_GUIDE.length - 1][measurement].max;
    if (!Number.isFinite(value) || value < smallest || value > largest) {
      return noMatchingSize();
    }
  }

  // Every relevant measurement must fit; averaging can recommend a size too small.
  let sizeIndex = BODY_SIZE_GUIDE.findIndex((row) => {
    return measurements.every((measurement) => Number(profile[`${measurement}Cm`]) <= row[measurement].max);
  });
  if (sizeIndex === -1) return noMatchingSize();
  if (profile.preferredFit === 'relaxed') sizeIndex += 1;

  const match = BODY_SIZE_GUIDE.slice(sizeIndex).find((row) => sizes.includes(row.size));
  if (!match) return noMatchingSize();

  return {
    size: match.size,
    confidence: 'ปานกลาง',
    source: 'ข้อมูลสัดส่วนมาตรฐาน',
    reason: `พิจารณาจาก${measuredAreas} และความชอบทรง ${getFitLabel(profile.preferredFit)}`
  };
}

function getStockStatus(product, size, selectedColor) {
  const variants = (product?.variants || []).filter((variant) => {
    const matchesSize = (variant.size || variant.size_or_color) === size;
    const matchesColor = !selectedColor || variant.color === selectedColor;
    return matchesSize && matchesColor;
  });

  for (const variant of variants) {
    const stock = variant.stock_quantity ?? variant.stockQuantity;
    if (Number(stock) > 0) return 'available';
  }

  if (variants.length === 0 || variants.some((variant) => {
    const stock = variant.stock_quantity ?? variant.stockQuantity;
    return stock == null || !Number.isFinite(Number(stock));
  })) {
    return 'unavailable';
  }
  return 'out-of-stock';
}

function getClosestAvailableSize(product, recommendedSize, selectedColor) {
  const recommendedIndex = SIZE_ORDER.indexOf(recommendedSize);
  const availableSizes = SIZE_ORDER.filter((size) => (
    getStockStatus(product, size, selectedColor) === 'available'
  ));

  if (availableSizes.length === 0) return null;
  return availableSizes.sort((first, second) => (
    Math.abs(SIZE_ORDER.indexOf(first) - recommendedIndex) -
    Math.abs(SIZE_ORDER.indexOf(second) - recommendedIndex)
  ))[0];
}

export function getSizeRecommendation(profile, product, fallbackSizes = [], selectedColor = '') {
  if (!profile) return null;
  if (profile.consentGiven === false) return null;

  const sizes = getProductSizes(product, fallbackSizes);
  if (sizes.length === 0) return noMatchingSize();

  const recommendation = recommendFromProductChart(profile, product, sizes) ||
    recommendFromMeasurements(profile, product, sizes);
  if (!recommendation.size) return recommendation;

  const status = getStockStatus(product, recommendation.size, selectedColor);
  return {
    ...recommendation,
    status,
    alternativeSize: status === 'available'
      ? null
      : getClosestAvailableSize(product, recommendation.size, selectedColor)
  };
}
