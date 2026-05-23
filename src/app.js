// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import historyRoutes from './routes/history.routes.js';
import authRoutes from './routes/auth.routes.js';
import checkRoutes from './routes/check.routes.js';
import healthRoutes from './routes/health.routes.js';
import trendRoutes from './routes/trend.routes.js';
import statRoutes from './routes/stat.route.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import categoryRoutes from './routes/category.route.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import newsRoutes from './routes/news.routes.js';


const app = express();

// ─── Security & Utilities ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});

app.use(globalLimiter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: false,
    deepLinking: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
}));
// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/checks', checkRoutes);
app.use('/api/history', historyRoutes );
app.use('/api/trends', trendRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/news', newsRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
