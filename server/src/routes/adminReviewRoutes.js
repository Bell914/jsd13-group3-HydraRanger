import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getAdminReviews, updateReviewVisibility } from '../controllers/reviewController.js';
import { validate, validateParams } from '../middleware/validatorMiddleware.js';
import { validateIdParam } from '../validators/commonValidator.js';
import { validateReviewVisibility } from '../validators/reviewValidator.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/', getAdminReviews);
router.patch('/:id/visibility', validateParams(validateIdParam), validate(validateReviewVisibility), updateReviewVisibility);

export default router;
