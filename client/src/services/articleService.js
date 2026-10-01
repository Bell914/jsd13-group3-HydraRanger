import { api, getApiBaseUrl } from './api.js';

export function getArticleImageUrl(imageUrl) {
  if (!imageUrl || imageUrl.startsWith('http') || !imageUrl.startsWith('/api/')) {
    return imageUrl;
  }
  return `${getApiBaseUrl().replace(/\/api\/?$/, '')}${imageUrl}`;
}

export function normalizeArticle(article) {
  return {
    ...article,
    id: article._id || article.id,
    image: getArticleImageUrl(article.imageUrl || article.image),
    description: article.excerpt || article.description || '',
    date: article.publishedAt
      ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(article.publishedAt))
      : article.date || '',
  };
}

export async function getArticles({ page = 1, limit = 9, category = '' } = {}) {
  const response = await api.get('/articles');
  const rawList = Array.isArray(response.data) ? response.data : [];
  const normalized = rawList.map(normalizeArticle);

  const filtered = category
    ? normalized.filter(
        (article) =>
          String(article.category).toLowerCase() === String(category).toLowerCase()
      )
    : normalized;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const articles = filtered.slice((safePage - 1) * limit, safePage * limit);

  return {
    articles,
    pagination: { page: safePage, limit, total, totalPages },
  };
}

export async function getArticleById(id) {
  try {
    const response = await api.get(`/articles/${encodeURIComponent(id)}`);
    return normalizeArticle(response.data);
  } catch {
    return null;
  }
}