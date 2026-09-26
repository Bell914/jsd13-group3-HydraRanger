const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5002/api';

export const ADMIN_USER_KEY = 'occasion_admin_user';
export const ADMIN_TOKEN_KEY = 'occasion_admin_session_token';

export function getAdminSessionToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminSession() {
  localStorage.removeItem('occasion_admin_token');
  localStorage.removeItem(ADMIN_USER_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

function redirectToLogin() {
  if (typeof window === 'undefined' || window.location.pathname === '/login') return;
  window.location.replace('/login');
}

export async function adminRequest(path, requestOptions = {}) {
  const {
    errorMessage = 'ทำรายการไม่สำเร็จ',
    networkMessage = 'เชื่อมต่อ Server ไม่ได้ กรุณาตรวจสอบว่า Server เปิดอยู่',
    redirectOnUnauthorized = true,
    ...fetchOptions
  } = requestOptions;

  try {
    const token = getAdminSessionToken();
    const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers
    };

    const response = await fetch(API_BASE_URL + path, {
      ...fetchOptions,
      credentials: 'include',
      headers
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && redirectOnUnauthorized) {
        clearAdminSession();
        redirectToLogin();
      }
      throw new Error(result.message || errorMessage);
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(networkMessage);
    }
    throw error;
  }
}
