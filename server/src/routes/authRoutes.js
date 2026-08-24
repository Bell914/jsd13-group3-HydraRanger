import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidator.js';

const router = Router();

router.post('/register', validate(validateRegisterInput), authController.register);
router.post('/login', validate(validateLoginInput), authController.login);
router.get('/me', protect, authController.getMe);

export default router;
