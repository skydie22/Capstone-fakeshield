// src/routes/check.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import * as checkController from '../controllers/check.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// All check routes require authentication
router.use(authenticate);

// POST /api/checks  — run a new AI check
/**
 * @swagger
 * /api/checks:
 *   post:
 *     summary: Jalankan prediksi AI pada teks
 *     tags: [Checks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: Ini adalah teks berita yang ingin dicek
 *     responses:
 *       201:
 *         description: Prediksi berhasil
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: AI Engine tidak dapat dijangkau
 */
router.post(
  '/',
  [
    body('text')
      .trim()
      .notEmpty().withMessage('Text is required.')
      .isLength({ min: 10 }).withMessage('Text must be at least 10 characters.'),
  ],
  validate,
  checkController.runCheck
);

//get /api/history
// router.get('/history', checkController.getHistory);
// GET /api/checks  — get user's history
// router.get('/', checkController.getHistory);

// GET /api/checks/:id  — get single check detail
/**
 * @swagger
 * /api/checks/{id}:
 *   get:
 *     summary: Detail hasil check berdasarkan ID (owner only)
 *     tags: [Checks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID dari check
 *     responses:
 *       200:
 *         description: Detail check berhasil diambil
 *       403:
 *         description: Bukan milik user ini
 *       404:
 *         description: Check tidak ditemukan
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', checkController.getCheckById);

export default router;
