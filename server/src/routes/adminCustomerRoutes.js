import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getCustomers,
  updateCustomer,
  updateCustomerStatus
} from '../controllers/customerController.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/', getCustomers);
router.put('/:id', updateCustomer);
router.patch('/:id/status', updateCustomerStatus);

export default router;
