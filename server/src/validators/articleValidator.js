export function validateArticleInput(article) {
  const errors = [];

  if (!article.title?.trim()) errors.push('Title is required');
  if (!article.excerpt?.trim()) errors.push('Excerpt is required');
  if (!article.content?.trim()) errors.push('Content is required');
  if (!article.category?.trim()) errors.push('Category is required');
  if (!article.imageUrl?.trim()) errors.push('Image URL is required');
  if (article.isPublished !== undefined && typeof article.isPublished !== 'boolean') {
    errors.push('isPublished must be true or false');
  }
  if (article.publishedAt && Number.isNaN(new Date(article.publishedAt).getTime())) {
    errors.push('Published date is invalid');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateArticleStatus({ isPublished }) {
  const isValid = typeof isPublished === 'boolean';
  return {
    isValid,
    errors: isValid ? [] : ['isPublished must be true or false'],
  };
}
