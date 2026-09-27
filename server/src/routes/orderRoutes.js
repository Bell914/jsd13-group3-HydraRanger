import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createOrder,
  getMyOrders,
  getMyOrderDetail,
  confirmPayment,
  cancelOrder
} from '../controllers/orderController.js';
import { validate } from '../middleware/validatorMiddleware.js';
import { validateCreateOrder } from '../validators/orderValidator.js';

const router = Router();

router.use(protect, authorize('user'));
router.post('/', validate(validateCreateOrder), createOrder);
router.get('/my', getMyOrders);
router.get('/my/:id', getMyOrderDetail);
router.post('/my/:id/confirm-payment', confirmPayment);
router.patch('/my/:id/cancel', cancelOrder);

export default router;
