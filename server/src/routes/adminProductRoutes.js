import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate, validateParams } from '../middleware/validatorMiddleware.js';
import { validateIdParam } from '../validators/commonValidator.js';
import { validateProductInput } from '../validators/productValidator.js';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/', getAdminProducts);
router.post('/', validate(validateProductInput), createProduct);
router.put('/:id', validateParams(validateIdParam), validate(validateProductInput), updateProduct);
router.delete('/:id', validateParams(validateIdParam), deleteProduct);

export default router;
