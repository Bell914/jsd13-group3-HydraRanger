import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createPaymentIntent } from '../controllers/paymentController.js';

const router = Router();
router.post('/create-payment-intent', protect, authorize('user'), createPaymentIntent);
export default router;
