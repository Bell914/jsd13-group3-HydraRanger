import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getLookbooks,
  getLookbookById,
  toggleFavoriteLookbook
} from '../controllers/lookbookController.js';

const router = Router();

// Public Routes
router.get('/', getLookbooks);
router.get('/:id', getLookbookById);

// Protected Routes (ต้องล็อกอิน)
router.post('/:id/favorite', protect, toggleFavoriteLookbook);

export default router;
