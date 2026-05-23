import { Router } from 'express';
import { getNews } from '../controllers/news.controller.js';

const router = Router();

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Ambil berita terkini dari Indonesia
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Berita berhasil diambil
 *       401:
 *         description: Unauthorized
 *       502:
 *         description: Gagal mengambil dari NewsAPI
 */
router.get('/', getNews);

export default router;