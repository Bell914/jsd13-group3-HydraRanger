import { Article } from '../models/Article.js';

function prepareArticleData(data) {
  return {
    title: data.title.trim(),
    excerpt: data.excerpt.trim(),
    content: data.content.trim(),
    category: data.category.trim(),
    imageUrl: data.imageUrl.trim(),
    author: data.author?.trim() || 'OCCASION',
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
    isPublished: data.isPublished ?? true,
  };
}

export function getPublicArticles() {
  return Article.find({ isPublished: true }).sort({ publishedAt: -1, createdAt: -1 });
}

export async function getPublicArticleById(id) {
  const article = await Article.findOne({ _id: id, isPublished: true });
  if (!article) throw new Error('Article not found');
  return article;
}

export function getAdminArticles() {
  return Article.find().sort({ publishedAt: -1, createdAt: -1 });
}

export function createArticle(data) {
  return Article.create(prepareArticleData(data));
}

export async function updateArticle(id, data) {
  const article = await Article.findByIdAndUpdate(id, prepareArticleData(data), {
    new: true,
    runValidators: true,
  });
  if (!article) throw new Error('Article not found');
  return article;
}

export async function updateArticleStatus(id, isPublished) {
  const article = await Article.findByIdAndUpdate(
    id,
    { isPublished },
    { new: true, runValidators: true }
  );
  if (!article) throw new Error('Article not found');
  return article;
}
