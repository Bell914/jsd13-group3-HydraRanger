import { Router } from 'express';
import { userController } from '../controllers/index.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { USER_ROLES } from '../config/constants.js';
import { validate, validateParams } from '../middleware/validatorMiddleware.js';
import { validateIdParam } from '../validators/commonValidator.js';
import { validateSizeProfile } from '../validators/sizeProfileValidator.js';

const router = Router();

router.get('/me/size-profile', protect, authorize(USER_ROLES.USER), userController.getMySizeProfile);
router.put(
  '/me/size-profile',
  protect,
  authorize(USER_ROLES.USER),
  validate(validateSizeProfile),
  userController.saveMySizeProfile
);
router.delete('/me/size-profile', protect, authorize(USER_ROLES.USER), userController.deleteMySizeProfile);
router.get('/', protect, authorize(USER_ROLES.ADMIN), userController.getUsers);
router.get('/:id', protect, validateParams(validateIdParam), userController.getUser);

export default router;