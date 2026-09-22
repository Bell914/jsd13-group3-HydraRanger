import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createOrder, getMyOrders } from '../controllers/orderController.js';
import { validate } from '../middleware/validatorMiddleware.js';
import { validateCreateOrder } from '../validators/orderValidator.js';

const router = Router();

router.use(protect, authorize('user'));
router.post('/', validate(validateCreateOrder), createOrder);
router.get('/my', getMyOrders);

export default router;
