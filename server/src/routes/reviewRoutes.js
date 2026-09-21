import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createReview, getProductReviews } from '../controllers/reviewController.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, authorize('user'), createReview);

export default router;
