import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimiterMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';
import {
  validateRegisterInput,
  validateLoginInput,
  validateChangePasswordInput,
  validateUpdateProfileInput
} from '../validators/authValidator.js';

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 500,
  message: 'Too many registration attempts, please try again later'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many login attempts, please try again later'
});

//router.post('/register', registerLimiter, validate(validateRegisterInput), authController.register);
//router.post('/login', loginLimiter, validate(validateLoginInput), authController.login);
// เปลี่ยนจากเดิมที่มี registerLimiter และ loginLimiter
router.post('/register', validate(validateRegisterInput), authController.register);
router.post('/login', validate(validateLoginInput), authController.login);
router.post('/refresh', authController.refresh);
router.post('/change-password', protect, validate(validateChangePasswordInput), authController.changePassword);
<<<<<<< HEAD
router.post('/reset-password', authController.resetPassword);
=======
router.put('/profile', protect, validate(validateUpdateProfileInput), authController.updateProfile);
>>>>>>> 9abd5a0233e221df2af334ab8ff7fce6b26e14c0
router.get('/me', protect, authController.getMe);

export default router;
