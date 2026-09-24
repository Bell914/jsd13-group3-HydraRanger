import { Router } from 'express';
import { userController } from '../controllers/index.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { USER_ROLES } from '../config/constants.js';
import { validate, validateParams } from '../middleware/validatorMiddleware.js';
import { validateIdParam } from '../validators/commonValidator.js';
import { validateSizeProfile } from '../validators/sizeProfileValidator.js';

const router = Router();

router.get('/addresses', protect, authorize(USER_ROLES.USER), userController.getAddresses);
router.post('/addresses', protect, authorize(USER_ROLES.USER), userController.addAddress);
router.delete(
  '/addresses/:addressId',
  protect,
  authorize(USER_ROLES.USER),
  userController.deleteAddress
);
router.patch(
  '/addresses/:addressId/default',
  protect,
  authorize(USER_ROLES.USER),
  userController.setDefaultAddress
);
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