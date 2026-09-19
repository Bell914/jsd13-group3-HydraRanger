import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getAdminReviews, updateReviewVisibility } from '../controllers/reviewController.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/', getAdminReviews);
router.patch('/:id/visibility', updateReviewVisibility);

export default router;
