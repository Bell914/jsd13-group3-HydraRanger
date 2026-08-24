import { Router } from 'express';
import { userController } from '../controllers/index.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { USER_ROLES } from '../config/constants.js';

const router = Router();

router.get('/', protect, authorize(USER_ROLES.ADMIN, USER_ROLES.USER), userController.getUsers);
router.get('/:id', protect, userController.getUser);

export default router;
