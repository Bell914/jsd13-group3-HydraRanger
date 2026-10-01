const normalizeCode = (value) => String(value || '').trim().toUpperCase();

export function validateAdminCouponInput(body = {}) {
  const errors = [];
  const code = normalizeCode(body.code);
  const discountValue = Number(body.discountValue);
  const minPurchase = Number(body.minPurchase ?? 0);
  const expiresAt = new Date(body.expiresAt);

  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) errors.push('Coupon code must be 3–32 letters, numbers, _ or -');
  if (!Number.isFinite(discountValue) || discountValue <= 0 || discountValue > 100) errors.push('Discount must be between 1 and 100');
  if (!Number.isFinite(minPurchase) || minPurchase < 0) errors.push('Minimum purchase must be zero or greater');
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) errors.push('Expiry date must be in the future');
  if (body.eventName !== undefined && (typeof body.eventName !== 'string' || body.eventName.trim().length > 100)) errors.push('Event name must be 100 characters or fewer');
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') errors.push('isActive must be true or false');

  return { isValid: errors.length === 0, errors };
}
