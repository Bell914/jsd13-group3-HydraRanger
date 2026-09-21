import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';
import { validateLookbookInput } from '../validators/lookbookValidator.js';
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
router.put('/:id', validate(validateLookbookInput), updateLookbook);
router.patch('/:id/status', updateLookbookStatus);

export default router;
