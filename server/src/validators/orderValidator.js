const ORDER_STATUSES = [
  'pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'
];

const SHIPPING_METHODS = ['standard', 'express', 'priority'];

export function validateCreateOrder(data) {
  const errors = [];
  const address = data.shippingAddress;

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    data.items.forEach((item, index) => {
      if (!item.productId) errors.push(`Item ${index + 1}: productId is required`);
      if (!item.variantId && !item.sku) {
        errors.push(`Item ${index + 1}: variantId or SKU is required`);
      }
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        errors.push(`Item ${index + 1}: quantity must be a positive whole number`);
      }
    });
  }

  const requiredAddressFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'zipCode'];
  requiredAddressFields.forEach((field) => {
    if (typeof address?.[field] !== 'string' || !address[field].trim()) {
      errors.push(`Shipping ${field} is required`);
    }
  });

  if (data.shippingMethod && !SHIPPING_METHODS.includes(data.shippingMethod)) {
    errors.push(`Shipping method must be one of: ${SHIPPING_METHODS.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
}

export function validateOrderStatus({ status }) {
  const isValid = ORDER_STATUSES.includes(status);
  return {
    isValid,
    errors: isValid ? [] : [`Status must be one of: ${ORDER_STATUSES.join(', ')}`]
  };
}
