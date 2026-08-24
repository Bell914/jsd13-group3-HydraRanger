import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import itemRoutes from './itemRoutes.js';
import { getDBStatus } from '../config/db.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'HydraRanger API Server (Sprint 2)',
    database: getDBStatus()
  });
});

// Sub-routes mounting
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/items', itemRoutes);

export default router;
