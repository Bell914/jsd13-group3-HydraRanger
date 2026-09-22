import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimiterMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';
import {
  validateRegisterInput,
  validateLoginInput,
  validateChangePasswordInput,
  validateUpdateProfileInput,
  validateRefreshToken
} from '../validators/authValidator.js';

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many registration attempts, please try again later'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later'
});

router.post('/register', registerLimiter, validate(validateRegisterInput), authController.register);
router.post('/login', loginLimiter, validate(validateLoginInput), authController.login);
router.post('/refresh', validate(validateRefreshToken), authController.refresh);
router.post('/change-password', protect, validate(validateChangePasswordInput), authController.changePassword);
router.put('/profile', protect, validate(validateUpdateProfileInput), authController.updateProfile);
router.get('/me', protect, authController.getMe);

export default router;
