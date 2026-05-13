import { Router } from 'express';
import { getHistory } from '../controllers/check.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Riwayat semua check
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List riwayat check berhasil diambil
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getHistory);

export default router;