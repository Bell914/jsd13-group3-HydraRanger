import { describe, expect, it } from 'vitest';
import { normalizeArticle } from '../services/articleService.js';

describe('article service', () => {
  it('normalizes an API article for the existing article cards', () => {
    const article = normalizeArticle({
      _id: '507f1f77bcf86cd799439011',
      title: 'แต่งตัวให้เข้ากับโอกาส',
      excerpt: 'คำแนะนำแบบสั้น',
      imageUrl: 'https://example.com/cover.webp',
      publishedAt: '2026-09-24T00:00:00.000Z',
    });

    expect(article.id).toBe('507f1f77bcf86cd799439011');
    expect(article.image).toBe('https://example.com/cover.webp');
    expect(article.description).toBe('คำแนะนำแบบสั้น');
    expect(article.date).not.toBe('');
  });

  it('keeps the legacy article shape as a fallback', () => {
    const article = normalizeArticle({ id: 1, image: '/cover.png', date: '30-08-2026' });
    expect(article.id).toBe(1);
    expect(article.image).toBe('/cover.png');
    expect(article.date).toBe('30-08-2026');
  });
});
