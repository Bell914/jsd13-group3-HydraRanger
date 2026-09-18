import { Router } from 'express';
import { getLookbooks, getLookbookById } from '../controllers/lookbookController.js';

const router = Router();

router.get('/', getLookbooks);
router.get('/:id', getLookbookById);

export default router;
