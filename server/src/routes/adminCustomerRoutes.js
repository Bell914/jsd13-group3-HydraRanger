import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getCustomers,
  updateCustomer,
  updateCustomerStatus
} from '../controllers/customerController.js';
import { validate, validateParams } from '../middleware/validatorMiddleware.js';
import { validateIdParam } from '../validators/commonValidator.js';
import { validateCustomerStatus, validateCustomerUpdate } from '../validators/customerValidator.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/', getCustomers);
router.put('/:id', validateParams(validateIdParam), validate(validateCustomerUpdate), updateCustomer);
router.patch('/:id/status', validateParams(validateIdParam), validate(validateCustomerStatus), updateCustomerStatus);

export default router;
