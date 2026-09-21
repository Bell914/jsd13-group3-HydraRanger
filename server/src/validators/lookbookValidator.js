export function validateLookbookInput(lookbook) {
  const errors = [];

  if (!lookbook.lookbookId?.trim()) errors.push('Lookbook ID is required');
  if (!lookbook.name?.trim()) errors.push('English name is required');
  if (!lookbook.nameTh?.trim()) errors.push('Thai name is required');
  if (!lookbook.concept?.trim()) errors.push('Concept is required');
  if (!lookbook.imageUrl?.trim()) errors.push('Image URL is required');

  if (!Array.isArray(lookbook.items) || lookbook.items.length === 0) {
    errors.push('At least one product is required');
  } else {
    lookbook.items.forEach((item, index) => {
      if (!item.product && !item.productId) errors.push(`Item ${index + 1}: product is required`);
      if (!item.defaultVariantSku) errors.push(`Item ${index + 1}: variant SKU is required`);
    });
  }

  if (!Number.isFinite(Number(lookbook.regularPrice)) || Number(lookbook.regularPrice) < 0) {
    errors.push('Regular price must be 0 or more');
  }
  if (!Number.isFinite(Number(lookbook.setPrice)) || Number(lookbook.setPrice) < 0) {
    errors.push('Set price must be 0 or more');
  }

  return { isValid: errors.length === 0, errors };
}
