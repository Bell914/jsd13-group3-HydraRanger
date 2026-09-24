import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { cancelPaymentIntent, createPaymentIntent } from '../controllers/paymentController.js';

const router = Router();
router.post('/create-payment-intent', protect, authorize('user'), createPaymentIntent);
router.post('/cancel-payment-intent', protect, authorize('user'), cancelPaymentIntent);
export default router;
