import { Router } from 'express';
import { getCategories } from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Jumlah per kategori confidence level untuk pie chart
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data kategori berhasil diambil
 */
router.get('/', authenticate, getCategories);

export default router;