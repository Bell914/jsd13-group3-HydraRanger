import { Router } from 'express';
import authRoutes from './authRoutes.js';
import adminAuthRoutes from './adminAuthRoutes.js';
import userRoutes from './userRoutes.js';
import itemRoutes from './itemRoutes.js';
import { getDBStatus } from '../config/db.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'OCCASION API Server',
    database: getDBStatus()
  });
});

// Sub-routes mounting
router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/users', userRoutes);
router.use('/items', itemRoutes);

export default router;
