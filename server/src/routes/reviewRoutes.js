import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createReview, getMyReviews, getProductReviews } from '../controllers/reviewController.js';
import { validate, validateParams } from '../middleware/validatorMiddleware.js';
import { validateProductIdParam } from '../validators/commonValidator.js';
import { validateReviewInput } from '../validators/reviewValidator.js';

const router = Router();

router.get('/product/:productId', validateParams(validateProductIdParam), getProductReviews);
router.get('/me', protect, authorize('user'), getMyReviews);
router.post('/', protect, authorize('user'), validate(validateReviewInput), createReview);

export default router;
