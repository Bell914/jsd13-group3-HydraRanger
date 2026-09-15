import { Router } from 'express';
import { adminLogin } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimiterMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';
import { validateLoginInput } from '../validators/authValidator.js';
import { authRateLimiter } from '../middleware/authRateLimiter.js';

const router = Router();

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many admin login attempts, please try again later'
});

router.post('/login', adminLoginLimiter, validate(validateLoginInput), adminLogin);
router.get('/me', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;