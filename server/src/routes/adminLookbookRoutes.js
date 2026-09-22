import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate, validateParams } from '../middleware/validatorMiddleware.js';
import { validateIdParam } from '../validators/commonValidator.js';
import { validateLookbookInput, validateLookbookStatus } from '../validators/lookbookValidator.js';
import {
  getAdminLookbooks,
  createLookbook,
  updateLookbook,
  updateLookbookStatus,
} from '../controllers/lookbookController.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/', getAdminLookbooks);
router.post('/', validate(validateLookbookInput), createLookbook);
router.put(
  '/:id',
  validateParams(validateIdParam),
  validate(validateLookbookInput),
  updateLookbook
);
router.patch(
  '/:id/status',
  validateParams(validateIdParam),
  validate(validateLookbookStatus),
  updateLookbookStatus
);

export default router;
