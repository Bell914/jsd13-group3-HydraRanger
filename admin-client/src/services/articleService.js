const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

async function sendRequest(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'จัดการบทความไม่สำเร็จ');
    return result.data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('เชื่อมต่อ Article API ไม่ได้ กรุณาตรวจสอบว่า Server เปิดอยู่');
    }
    throw error;
  }
}

export function getArticles() {
  return sendRequest('/admin/articles');
}

export function createArticle(article) {
  return sendRequest('/admin/articles', {
    method: 'POST',
    body: JSON.stringify(article),
  });
}

export function updateArticle(id, article) {
  return sendRequest(`/admin/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(article),
  });
}

export function updateArticleStatus(id, isPublished) {
  return sendRequest(`/admin/articles/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isPublished }),
  });
}
