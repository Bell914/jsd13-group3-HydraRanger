import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate, validateParams } from '../middleware/validatorMiddleware.js';
import { validateIdParam } from '../validators/commonValidator.js';
import { validateArticleInput, validateArticleStatus } from '../validators/articleValidator.js';
import {
  getAdminArticles,
  createArticle,
  updateArticle,
  updateArticleStatus,
} from '../controllers/articleController.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/', getAdminArticles);
router.post('/', validate(validateArticleInput), createArticle);
router.put(
  '/:id',
  validateParams(validateIdParam),
  validate(validateArticleInput),
  updateArticle
);
router.patch(
  '/:id/status',
  validateParams(validateIdParam),
  validate(validateArticleStatus),
  updateArticleStatus
);

export default router;
