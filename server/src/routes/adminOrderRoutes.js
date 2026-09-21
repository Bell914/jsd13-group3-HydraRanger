import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getAdminOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/', getAdminOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;
