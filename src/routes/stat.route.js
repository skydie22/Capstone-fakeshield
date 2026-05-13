
import { Router } from 'express';
import { getStats } from '../controllers/stat.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Summary statistik untuk dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data statistik berhasil diambil
 */
router.get('/', authenticate, getStats);

export default router;