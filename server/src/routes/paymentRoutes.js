import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createPaymentIntent, bindPaymentIntent } from '../controllers/paymentController.js';

const router = Router();
router.post('/create-payment-intent', protect, authorize('user'), createPaymentIntent);
router.post('/bind-payment-intent', protect, authorize('user'), bindPaymentIntent);
export default router;
