import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidator.js';
import { authRateLimiter } from '../middleware/authRateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, validate(validateRegisterInput), authController.register);
router.post('/login', authRateLimiter, validate(validateLoginInput), authController.login);
router.get('/me', protect, authController.getMe);

export default router;
