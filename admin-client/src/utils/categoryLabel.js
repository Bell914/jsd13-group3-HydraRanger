export function getCategoryLabel(category) {
  if (category === 'tops') return 'เสื้อ';
  if (category === 'bottoms') return 'กางเกง';
  return category || '-';
}
