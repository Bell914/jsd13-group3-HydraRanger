export function validateProductForm(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = 'กรุณากรอกชื่อสินค้า';
  if (!form.description.trim()) errors.description = 'กรุณากรอกรายละเอียดสินค้า';

  const tags = form.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  if (tags.length === 0) errors.tags = 'กรุณากรอก Tag อย่างน้อย 1 รายการ';
  if (!form.availableDate || Number.isNaN(new Date(form.availableDate).getTime())) {
    errors.availableDate = 'กรุณาเลือกวันที่เริ่มจำหน่ายที่ถูกต้อง';
  }

  form.variants.forEach((variant, index) => {
    if (!variant.sku.trim()) errors[`variant-${index}-sku`] = 'กรุณากรอก SKU';
    if (!variant.color.trim()) errors[`variant-${index}-color`] = 'กรุณากรอกสี';
    const price = Number(variant.price);
    const stock = Number(variant.stockQuantity);
    if (variant.price === '' || !Number.isFinite(price) || price <= 0) {
      errors[`variant-${index}-price`] = 'ราคาต้องมากกว่า 0';
    }
    if (variant.stockQuantity === '' || !Number.isInteger(stock) || stock < 0) {
      errors[`variant-${index}-stock`] = 'สต็อกต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป';
    }
  });

  const usedSizes = new Set();
  form.sizeChart.forEach((row, index) => {
    const chest = Number(row.garmentChestActual);
    if (usedSizes.has(row.sizeName)) errors[`size-chart-${index}-size`] = 'ไซส์ในตารางต้องไม่ซ้ำกัน';
    usedSizes.add(row.sizeName);
    if (row.garmentChestActual === '' || !Number.isFinite(chest) || chest <= 0) {
      errors[`size-chart-${index}-chest`] = 'รอบอกเสื้อต้องมากกว่า 0';
    }
  });

  return errors;
}
