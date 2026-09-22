export function validateReviewInput({ orderId, productId, rating, comment }) {
  const errors = [];
  if (typeof orderId !== 'string' || !/^[a-f\d]{24}$/i.test(orderId)) {
    errors.push('A valid order ID is required');
  }
  if (typeof productId !== 'string' || !/^[a-f\d]{24}$/i.test(productId)) {
    errors.push('A valid product ID is required');
  }
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    errors.push('Rating must be a whole number from 1 to 5');
  }
  if (typeof comment !== 'string' || comment.trim().length < 3 || comment.trim().length > 1000) {
    errors.push('Comment must contain 3 to 1000 characters');
  }
  return { isValid: errors.length === 0, errors };
}

export function validateReviewVisibility({ isVisible }) {
  const isValid = typeof isVisible === 'boolean';
  return {
    isValid,
    errors: isValid ? [] : ['isVisible must be true or false']
  };
}
