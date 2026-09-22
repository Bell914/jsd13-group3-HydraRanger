import { Router } from 'express';
<<<<<<< HEAD
import { protect } from '../middleware/authMiddleware.js';
import { lookbookController } from '../controllers/index.js';

const router = Router();

router.post('/:id/favorite', protect, lookbookController.toggleFavoriteLookbook);

export default router;
=======
import { getLookbooks, getLookbookById } from '../controllers/lookbookController.js';

const router = Router();

router.get('/', getLookbooks);
router.get('/:id', getLookbookById);

export default router;
>>>>>>> 9abd5a0233e221df2af334ab8ff7fce6b26e14c0
