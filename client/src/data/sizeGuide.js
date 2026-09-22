export const BODY_SIZE_GUIDE = [
  {
    size: 'S',
    chest: { min: 82, max: 88 },
    waist: { min: 66, max: 74 },
    hips: { min: 88, max: 94 }
  },
  {
    size: 'M',
    chest: { min: 89, max: 98 },
    waist: { min: 75, max: 84 },
    hips: { min: 95, max: 102 }
  },
  {
    size: 'L',
    chest: { min: 99, max: 108 },
    waist: { min: 85, max: 94 },
    hips: { min: 103, max: 112 }
  }
];

export function cmToInch(value) {
  return Number(value) / 2.54;
}

export function inchToCm(value) {
  return Number(value) * 2.54;
}

export function formatMeasurementRange(range, unit) {
  if (unit === 'inch') {
    return `${cmToInch(range.min).toFixed(1)}–${cmToInch(range.max).toFixed(1)} นิ้ว`;
  }

  return `${range.min}–${range.max} ซม.`;
}

export function getProductCategory(product) {
  return product?.category_id?.slug || product?.category || '';
}
