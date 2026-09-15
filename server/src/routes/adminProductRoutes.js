import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';
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
router.put('/:id', validate(validateProductInput), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
