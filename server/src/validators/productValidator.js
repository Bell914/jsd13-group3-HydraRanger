export function validateProductInput(product) {
  const errors = [];

  const title = product.title || product.name;
  if (!title || !title.trim()) {
    errors.push('Product title is required');
  }

  if (!product.category_id && !product.category) {
    errors.push('Category is required');
  }

  // Validate tags if provided
  if (product.tags !== undefined && product.tags !== null) {
    if (!Array.isArray(product.tags)) {
      errors.push('Tags must be an array of strings');
    } else if (product.tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
      errors.push('Each tag must be a non-empty string');
    }
  }

  // Validate availableDate if provided
  if (product.availableDate !== undefined && product.availableDate !== null && product.availableDate !== '') {
    const isStringOrDate = typeof product.availableDate === 'string' || product.availableDate instanceof Date;
    const parsedDate = new Date(product.availableDate);
    if (!isStringOrDate || isNaN(parsedDate.getTime())) {
      errors.push('availableDate must be a valid date format (e.g. YYYY-MM-DD)');
    }
  }

  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    errors.push('At least one product variant is required');
  } else {
    const seenSkus = new Set();

    product.variants.forEach((variant, index) => {
      if (!variant.sku || !variant.sku.trim()) {
        errors.push(`Variant ${index + 1}: SKU is required`);
      } else {
        const normalizedSku = variant.sku.trim().toUpperCase();
        if (seenSkus.has(normalizedSku)) {
          errors.push(`Variant ${index + 1}: Duplicate SKU '${variant.sku.trim()}' within product`);
        } else {
          seenSkus.add(normalizedSku);
        }
      }

      if (!variant.size_or_color && !variant.color && !variant.size) {
        errors.push(`Variant ${index + 1}: size_or_color is required`);
      }

      if (!Number.isFinite(variant.price) || variant.price <= 0) {
        errors.push(`Variant ${index + 1}: price must be greater than 0`);
      }

      const stock = variant.stock_quantity ?? variant.stockQuantity;
      if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
        errors.push(`Variant ${index + 1}: stock must be a whole number of 0 or more`);
      }
    });
  }

  return { isValid: errors.length === 0, errors };
}
