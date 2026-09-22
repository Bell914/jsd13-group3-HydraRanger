import { BODY_SIZE_GUIDE, getProductCategory } from '../data/sizeGuide.js';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function getFitEase(preferredFit) {
  if (preferredFit === 'fitted') return 4;
  if (preferredFit === 'relaxed') return 12;
  return 8;
}

function getAvailableSizes(product, fallbackSizes) {
  const variantSizes = (product?.variants || [])
    .map((variant) => variant.size || variant.size_or_color)
    .filter((size) => SIZE_ORDER.includes(size));

  const sizes = [...new Set([...variantSizes, ...(fallbackSizes || [])])];
  return SIZE_ORDER.filter((size) => sizes.includes(size));
}

function recommendFromProductChart(profile, product, availableSizes) {
  const chart = (product?.size_chart || product?.sizeChart || [])
    .map((item) => ({
      size: item.size_name || item.size,
      garmentChest: Number(item.garment_chest_actual || item.garmentChest)
    }))
    .filter((item) => availableSizes.includes(item.size) && Number.isFinite(item.garmentChest))
    .sort((first, second) => first.garmentChest - second.garmentChest);

  if (chart.length === 0) return null;

  const targetChest = Number(profile.chestCm) + getFitEase(profile.preferredFit);
  const match = chart.find((item) => item.garmentChest >= targetChest) || chart[chart.length - 1];

  return {
    size: match.size,
    confidence: 'สูง',
    source: 'ตารางไซส์ของสินค้านี้',
    reason: `รอบอก ${profile.chestCm} ซม. และความชอบทรง ${getFitLabel(profile.preferredFit)}`
  };
}

function getSizeScore(value, measurementName) {
  const matchingIndex = BODY_SIZE_GUIDE.findIndex((row) => {
    return value <= row[measurementName].max;
  });

  if (matchingIndex === -1) return BODY_SIZE_GUIDE.length;
  return matchingIndex + 1;
}

function getFitLabel(preferredFit) {
  if (preferredFit === 'fitted') return 'พอดีตัว';
  if (preferredFit === 'relaxed') return 'หลวมสบาย';
  return 'มาตรฐาน';
}

function recommendFromMeasurements(profile, product, availableSizes) {
  const category = getProductCategory(product);
  let scores;
  let measuredAreas;

  if (category === 'tops') {
    scores = [
      getSizeScore(Number(profile.chestCm), 'chest'),
      getSizeScore(Number(profile.waistCm), 'waist')
    ];
    measuredAreas = 'รอบอกและรอบเอว';
  } else if (category === 'bottoms') {
    scores = [
      getSizeScore(Number(profile.waistCm), 'waist'),
      getSizeScore(Number(profile.hipsCm), 'hips')
    ];
    measuredAreas = 'รอบเอวและรอบสะโพก';
  } else {
    scores = [
      getSizeScore(Number(profile.chestCm), 'chest'),
      getSizeScore(Number(profile.waistCm), 'waist'),
      getSizeScore(Number(profile.hipsCm), 'hips')
    ];
    measuredAreas = 'รอบอก รอบเอว และรอบสะโพก';
  }
  let score = Math.round(scores.reduce((sum, item) => sum + item, 0) / scores.length);
  if (profile.preferredFit === 'relaxed') score += 1;
  score = Math.max(1, Math.min(3, score));

  const standardSize = BODY_SIZE_GUIDE[score - 1].size;
  const standardIndex = SIZE_ORDER.indexOf(standardSize);
  const closestSize = [...availableSizes].sort((first, second) => {
    return Math.abs(SIZE_ORDER.indexOf(first) - standardIndex) -
      Math.abs(SIZE_ORDER.indexOf(second) - standardIndex);
  })[0];

  return {
    size: closestSize || standardSize,
    confidence: 'ปานกลาง',
    source: 'ข้อมูลสัดส่วนมาตรฐาน',
    reason: `พิจารณาจาก${measuredAreas} และความชอบทรง ${getFitLabel(profile.preferredFit)}`
  };
}

export function getSizeRecommendation(profile, product, fallbackSizes = []) {
  if (!profile) return null;
  const availableSizes = getAvailableSizes(product, fallbackSizes);
  if (availableSizes.length === 0) return null;

  return recommendFromProductChart(profile, product, availableSizes) ||
    recommendFromMeasurements(profile, product, availableSizes);
}
