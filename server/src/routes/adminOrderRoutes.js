import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getAdminOrders, updateOrderStatus } from '../controllers/orderController.js';
import { validate, validateParams } from '../middleware/validatorMiddleware.js';
import { validateIdParam } from '../validators/commonValidator.js';
import { validateOrderStatus } from '../validators/orderValidator.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/', getAdminOrders);
router.patch('/:id/status', validateParams(validateIdParam), validate(validateOrderStatus), updateOrderStatus);

export default router;
