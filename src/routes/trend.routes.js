import { Router } from 'express';
import { getTrends } from '../controllers/trend.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /api/trends:
 *   get:
 *     summary: Data tren hoax per hari untuk chart
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data tren berhasil diambil
 */
router.get('/', authenticate, getTrends);

export default router;