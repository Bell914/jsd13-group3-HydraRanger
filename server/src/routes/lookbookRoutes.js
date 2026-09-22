import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getLookbooks, getLookbookById, toggleFavoriteLookbook } from '../controllers/lookbookController.js';

const router = Router();

router.get('/', getLookbooks);
router.get('/:id', getLookbookById);
router.post('/:id/favorite', protect, toggleFavoriteLookbook);

export default router;
