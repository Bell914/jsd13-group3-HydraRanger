import { adminRequest } from './adminApi.js';

async function sendRequest(path, options = {}) {
  const result = await adminRequest(path, {
    ...options,
    errorMessage: 'จัดการบทความไม่สำเร็จ',
    networkMessage: 'เชื่อมต่อ Article API ไม่ได้ กรุณาตรวจสอบว่า Server เปิดอยู่'
  });
  return result.data;
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
