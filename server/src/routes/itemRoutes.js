import { Router } from 'express';
import { itemController } from '../controllers/index.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';
import { validateItemInput } from '../validators/itemValidator.js';

const router = Router();

router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.post('/', protect, validate(validateItemInput), itemController.createItem);
router.put('/:id', protect, validate(validateItemInput), itemController.updateItem);
router.delete('/:id', protect, itemController.deleteItem);

export default router;
