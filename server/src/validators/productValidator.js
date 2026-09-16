export function validateProductInput(product) {
  const errors = [];

  const title = product.title || product.name;
  if (!title || !title.trim()) {
    errors.push('Product title is required');
  }

  if (!product.category_id && !product.category) {
    errors.push('Category is required');
  }

  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    errors.push('At least one product variant is required');
  } else {
    product.variants.forEach((variant, index) => {
      if (!variant.sku || !variant.sku.trim()) {
        errors.push(`Variant ${index + 1}: SKU is required`);
      }
      if (!variant.size_or_color && !variant.color && !variant.size) {
        errors.push(`Variant ${index + 1}: size_or_color is required`);
      }
      if (!Number.isFinite(variant.price) || variant.price < 0) {
        errors.push(`Variant ${index + 1}: price must be 0 or more`);
      }
      const stock = variant.stock_quantity ?? variant.stockQuantity;
      if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
        errors.push(`Variant ${index + 1}: stock must be a whole number of 0 or more`);
      }
    });
  }

  return { isValid: errors.length === 0, errors };
}
