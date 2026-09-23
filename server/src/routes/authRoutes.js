import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimiterMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';
import { forgotPasswordLimiter } from '../middleware/authRateLimiter.js';
import {
  validateRegisterInput,
  validateLoginInput,
  validateChangePasswordInput,
  validateUpdateProfileInput,
  validateRefreshToken,
  validateForgotPasswordInput,
  validateResetPasswordInput
} from '../validators/authValidator.js';

const router = Router();

const registerLimiter = rateLimit({
  name: 'register',
  shared: true,
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many registration attempts, please try again later'
});

const loginLimiter = rateLimit({
  name: 'customer-login',
  shared: true,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again later'
});

const resetPasswordLimiter = rateLimit({
  name: 'reset-password',
  shared: true,
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many password reset attempts, please try again later'
});

router.post('/register', registerLimiter, validate(validateRegisterInput), authController.register);
router.post('/login', loginLimiter, validate(validateLoginInput), authController.login);
router.post('/refresh', validate(validateRefreshToken), authController.refresh);
router.post('/change-password', protect, validate(validateChangePasswordInput), authController.changePassword);
router.put('/profile', protect, validate(validateUpdateProfileInput), authController.updateProfile);
router.get('/me', protect, authController.getMe);
router.post('/forgot-password', forgotPasswordLimiter, validate(validateForgotPasswordInput), authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordLimiter, validate(validateResetPasswordInput), authController.resetPassword);

export default router;
