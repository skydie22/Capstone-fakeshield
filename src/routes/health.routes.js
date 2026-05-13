// src/routes/health.routes.js
import { Router } from 'express';
import { health } from '../controllers/health.controller.js';

const router = Router();

// GET /api/health
router.get('/', health);

export default router;
