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

export async function getArticles() {
  const response = await api.get('/articles');
  return (response.data || []).map(normalizeArticle);
}

export async function getArticleById(id) {
  const response = await api.get(`/articles/${id}`);
  return normalizeArticle(response.data);
}
