import { describe, expect, it } from 'vitest';
import { getSizeRecommendation } from '../utils/sizeRecommendation.js';

const regularProfile = {
  consentGiven: true,
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
    expect(result.confidence).toBe('ปานกลาง');
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

  it('uses the product waist and hips chart for bottoms', () => {
    const product = {
      category: 'bottoms',
      variants: [{ size: 'S', stockQuantity: 1 }, { size: 'M', stockQuantity: 1 }],
      size_chart: [
        { size_name: 'S', garment_waist_actual: 80, garment_hips_actual: 100 },
        { size_name: 'M', garment_waist_actual: 88, garment_hips_actual: 108 }
      ]
    };
    const result = getSizeRecommendation(regularProfile, product, ['S', 'M']);
    expect(result.size).toBe('M');
    expect(result.source).toContain('ตารางรอบเอวและสะโพก');
  });

  it('does not recommend a size before the customer saves a profile', () => {
    expect(getSizeRecommendation(null, {}, ['S', 'M', 'L'])).toBeNull();
  });

  it('requires explicit consent before using body measurements', () => {
    const missingConsent = { ...regularProfile, consentGiven: undefined };
    const declinedConsent = { ...regularProfile, consentGiven: false };

    expect(getSizeRecommendation(missingConsent, {}, ['S', 'M', 'L'])).toBeNull();
    expect(getSizeRecommendation(declinedConsent, {}, ['S', 'M', 'L'])).toBeNull();
  });
});


describe('Size recommendation edge cases', () => {
  const variants = [
    { size: 'S', stockQuantity: 3 },
    { size: 'M', stockQuantity: 3 },
    { size: 'L', stockQuantity: 3 }
  ];

  it('does not recommend the largest chart size when the chest exceeds it', () => {
    const result = getSizeRecommendation({ ...regularProfile, chestCm: 150 }, {
      category: 'tops', variants,
      size_chart: [{ size_name: 'L', garment_chest_actual: 110 }]
    });
    expect(result.status).toBe('no-match');
    expect(result.size).toBeNull();
  });

  it('fits the largest relevant measurement rather than averaging sizes', () => {
    const result = getSizeRecommendation({ ...regularProfile, chestCm: 108, waistCm: 66 }, {
      category: 'tops', variants
    });
    expect(result.size).toBe('L');
  });

  it('does not substitute a smaller size when the fitting size is missing', () => {
    const result = getSizeRecommendation(regularProfile, {
      category: 'tops', variants: [{ size: 'S', stockQuantity: 10 }]
    }, ['S', 'M', 'L']);
    expect(result.status).toBe('no-match');
  });

  it('does not claim a fit outside either end of the standard body guide', () => {
    for (const chestCm of [60, 150]) {
      const result = getSizeRecommendation({ ...regularProfile, chestCm }, { category: 'tops', variants });
      expect(result.status).toBe('no-match');
    }
  });

  it('does not clamp a relaxed fit to the largest size', () => {
    const result = getSizeRecommendation({ ...regularProfile, chestCm: 108, preferredFit: 'relaxed' }, {
      category: 'tops', variants
    });
    expect(result.status).toBe('no-match');
  });

  it('uses waist and hips for bottoms even when a chest chart exists', () => {
    const result = getSizeRecommendation(regularProfile, {
      category: 'bottoms', variants,
      size_chart: [{ size_name: 'S', garment_chest_actual: 200 }]
    });
    expect(result.size).toBe('M');
    expect(result.reason).toContain('รอบเอวและรอบสะโพก');
  });

  it('checks stock for the selected color without recommending a different fit', () => {
    const product = { category: 'tops', variants: [
      { size: 'M', color: 'Black', stock_quantity: 0 },
      { size: 'M', color: 'White', stock_quantity: 2 },
      { size: 'L', color: 'Black', stock_quantity: 5 }
    ] };
    expect(getSizeRecommendation(regularProfile, product, [], 'Black')).toMatchObject({
      size: 'M', status: 'out-of-stock', alternativeSize: 'L'
    });
    expect(getSizeRecommendation(regularProfile, product, [], 'White').status).toBe('available');
    expect(getSizeRecommendation(regularProfile, product, [], 'Blue').status).toBe('unavailable');
  });

  it('only offers a larger in-stock size as an alternative', () => {
    const bothSidesAvailable = { category: 'tops', variants: [
      { size: 'S', color: 'Black', stock_quantity: 5 },
      { size: 'M', color: 'Black', stock_quantity: 0 },
      { size: 'L', color: 'Black', stock_quantity: 5 }
    ] };
    expect(getSizeRecommendation(regularProfile, bothSidesAvailable, [], 'Black').alternativeSize).toBe('L');

    const smallerOnly = { category: 'tops', variants: [
      { size: 'S', color: 'Black', stock_quantity: 5 },
      { size: 'M', color: 'Black', stock_quantity: 0 }
    ] };
    expect(getSizeRecommendation(regularProfile, smallerOnly, [], 'Black').alternativeSize).toBeNull();
  });

  it('does not enable purchase when stock is unknown', () => {
    const result = getSizeRecommendation(regularProfile, { category: 'tops', variants: [{ size: 'M' }] });
    expect(result.status).toBe('unavailable');
  });
});
