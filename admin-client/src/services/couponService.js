const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'จัดการคูปองไม่สำเร็จ');
  return result.data;
}

export const couponService = {
  list: () => request('/admin/coupons'),
  create: (coupon) => request('/admin/coupons', { method: 'POST', body: JSON.stringify(coupon) }),
  update: (id, coupon) => request(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(coupon) }),
  setActive: (id, isActive) => request(`/admin/coupons/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
};
