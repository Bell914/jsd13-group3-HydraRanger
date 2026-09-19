import { describe, expect, it } from 'vitest';
import { getSizeRecommendation } from '../utils/sizeRecommendation.js';

const regularProfile = {
  chestCm: 90,
  waistCm: 76,
  hipsCm: 96,
  preferredFit: 'regular'
};

describe('Personalized Size Recommendation', () => {
  it('uses the product size chart when one is available', () => {
    const product = {
      variants: [{ size: 'S' }, { size: 'M' }, { size: 'L' }],
      size_chart: [
        { size_name: 'S', garment_chest_actual: 94 },
        { size_name: 'M', garment_chest_actual: 102 },
        { size_name: 'L', garment_chest_actual: 110 }
      ]
    };

    const result = getSizeRecommendation(regularProfile, product, ['S', 'M', 'L']);
    expect(result.size).toBe('M');
    expect(result.confidence).toBe('สูง');
  });

  it('falls back to body measurements when a product has no size chart', () => {
    const product = {
      category: 'tops',
      variants: [{ size: 'S' }, { size: 'M' }, { size: 'L' }]
    };
    const result = getSizeRecommendation(regularProfile, product, ['S', 'M', 'L']);
    expect(result.size).toBe('M');
    expect(result.confidence).toBe('ปานกลาง');
  });

  it('uses waist and hips for a bottoms recommendation', () => {
    const product = {
      category: 'bottoms',
      variants: [{ size: 'S' }, { size: 'M' }, { size: 'L' }]
    };

    const result = getSizeRecommendation(regularProfile, product, ['S', 'M', 'L']);
    expect(result.size).toBe('M');
    expect(result.reason).toContain('รอบเอวและรอบสะโพก');
  });

  it('does not recommend a size before the customer saves a profile', () => {
    expect(getSizeRecommendation(null, {}, ['S', 'M', 'L'])).toBeNull();
  });
});
