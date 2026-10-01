import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';

const router = Router();

router.get('/', protect, authorize('admin'), getDashboardSummary);

export default router;
