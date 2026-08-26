import { Router } from 'express';
import { adminLogin } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';
import { validateLoginInput } from '../validators/authValidator.js';

const router = Router();

router.post('/login', validate(validateLoginInput), adminLogin);
router.get('/me', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;
