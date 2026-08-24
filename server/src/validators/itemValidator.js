import { ITEM_STATUS, ITEM_PRIORITY, ITEM_CATEGORIES } from '../config/constants.js';

export const validateItemInput = ({ title, description, category, status, priority }) => {
  const errors = [];

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Item title is required');
  } else if (title.trim().length > 100) {
    errors.push('Title must not exceed 100 characters');
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Item description is required');
  }

  if (category && !ITEM_CATEGORIES.includes(category)) {
    errors.push(`Invalid category. Allowed categories: ${ITEM_CATEGORIES.join(', ')}`);
  }

  if (status && !Object.values(ITEM_STATUS).includes(status)) {
    errors.push(`Invalid status. Allowed statuses: ${Object.values(ITEM_STATUS).join(', ')}`);
  }

  if (priority && !Object.values(ITEM_PRIORITY).includes(priority)) {
    errors.push(`Invalid priority. Allowed priorities: ${Object.values(ITEM_PRIORITY).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
