import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { lookbookController } from '../controllers/index.js';

const router = Router();

router.post('/:id/favorite', protect, lookbookController.toggleFavoriteLookbook);

export default router;