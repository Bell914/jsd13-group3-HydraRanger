import { Router } from 'express';
import { validateParams } from '../middleware/validatorMiddleware.js';
import { validateIdParam } from '../validators/commonValidator.js';
import { getArticles, getArticleById } from '../controllers/articleController.js';

const router = Router();

router.get('/', getArticles);
router.get('/:id', validateParams(validateIdParam), getArticleById);

export default router;
