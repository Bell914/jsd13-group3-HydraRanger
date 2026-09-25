import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate, validateParams } from '../middleware/validatorMiddleware.js';
import { validateIdParam } from '../validators/commonValidator.js';
import { validateAdminCouponInput } from '../validators/couponValidator.js';
import { getAdminCoupons, createAdminCoupon, updateAdminCoupon, updateAdminCouponStatus } from '../controllers/adminCouponController.js';

const router = Router();
router.use(protect, authorize('admin'));
router.get('/', getAdminCoupons);
router.post('/', validate(validateAdminCouponInput), createAdminCoupon);
router.put('/:id', validateParams(validateIdParam), validate(validateAdminCouponInput), updateAdminCoupon);
router.patch('/:id/status', validateParams(validateIdParam), validate((body) => ({ isValid: typeof body.isActive === 'boolean', errors: ['isActive must be true or false'] })), updateAdminCouponStatus);
export default router;
