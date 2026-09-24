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

  if (product.size_chart !== undefined) {
    if (!Array.isArray(product.size_chart)) {
      errors.push('size_chart must be an array');
    } else {
      const sizeNames = new Set();
      const category = product.category?.slug || product.category;
      product.size_chart.forEach((row, index) => {
        const sizeName = row?.size_name?.trim();
        const chest = Number(row?.garment_chest_actual);
        const waist = Number(row?.garment_waist_actual);
        const hips = Number(row?.garment_hips_actual);
        if (!sizeName) errors.push(`Size chart ${index + 1}: size_name is required`);
        if (sizeNames.has(sizeName)) errors.push(`Size chart ${index + 1}: duplicate size '${sizeName}'`);
        if (sizeName) sizeNames.add(sizeName);
        if (category === 'bottoms' && (!Number.isFinite(waist) || waist <= 0)) {
          errors.push(`Size chart ${index + 1}: garment_waist_actual must be greater than 0`);
        }
        if (category === 'bottoms' && (!Number.isFinite(hips) || hips <= 0)) {
          errors.push(`Size chart ${index + 1}: garment_hips_actual must be greater than 0`);
        }
        if (category !== 'bottoms' && (!Number.isFinite(chest) || chest <= 0)) {
          errors.push(`Size chart ${index + 1}: garment_chest_actual must be greater than 0`);
        }
      });
    }
  }

  return { isValid: errors.length === 0, errors };
}
