import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createOrder, getMyOrders } from '../controllers/orderController.js';

const router = Router();

router.use(protect, authorize('user'));
router.post('/', createOrder);
router.get('/my', getMyOrders);

export default router;
