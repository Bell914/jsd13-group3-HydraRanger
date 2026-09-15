const allowedGenders = ['unisex', 'women', 'men'];

export function validateProductInput(product) {
  const errors = [];

  if (!product.name || !product.name.trim()) {
    errors.push('Product name is required');
  }

  if (!product.description || !product.description.trim()) {
    errors.push('Product description is required');
  }

  if (!product.category || !product.category.trim()) {
    errors.push('Product category is required');
  }

  if (product.gender && !allowedGenders.includes(product.gender)) {
    errors.push('Gender must be unisex, women, or men');
  }

  if (!product.availableDate) {
    errors.push('Available date is required');
  }

  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    errors.push('At least one product variant is required');
  } else {
    product.variants.forEach((variant, index) => {
      if (!variant.sku || !variant.sku.trim()) {
        errors.push(`Variant ${index + 1}: SKU is required`);
      }
      if (!variant.color || !variant.color.trim()) {
        errors.push(`Variant ${index + 1}: color is required`);
      }
      if (!variant.size || !variant.size.trim()) {
        errors.push(`Variant ${index + 1}: size is required`);
      }
      if (!Number.isFinite(variant.price) || variant.price <= 0) {
        errors.push(`Variant ${index + 1}: price must be greater than 0`);
      }
      if (!Number.isInteger(variant.stockQuantity) || variant.stockQuantity < 0) {
        errors.push(`Variant ${index + 1}: stock must be a whole number of 0 or more`);
      }
    });
  }

  return { isValid: errors.length === 0, errors };
}
