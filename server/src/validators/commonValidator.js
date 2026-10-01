export function validateIdParam({ id }) {
  const isMongoId = typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
  return {
    isValid: isMongoId,
    errors: isMongoId ? [] : ['A valid ID is required']
  };
}

export function validateProductIdParam({ productId }) {
  const isMongoId = typeof productId === 'string' && /^[a-f\d]{24}$/i.test(productId);
  return {
    isValid: isMongoId,
    errors: isMongoId ? [] : ['A valid product ID is required']
  };
}
