export function validateCustomerUpdate({ username, avatar }) {
  const errors = [];
  if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 30) {
    errors.push('Username must contain 3 to 30 characters');
  }
  if (avatar !== undefined && typeof avatar !== 'string') {
    errors.push('Avatar must be a text URL');
  }
  return { isValid: errors.length === 0, errors };
}

export function validateCustomerStatus({ isActive }) {
  const isValid = typeof isActive === 'boolean';
  return {
    isValid,
    errors: isValid ? [] : ['isActive must be true or false']
  };
}
