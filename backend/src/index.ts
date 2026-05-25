import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import documentRoutes from './routes/documents';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './utils/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'https://lexiguard-doctrust.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging & parsing
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'LexiGuard API' });
  } catch {
    res.status(503).json({ status: 'unhealthy', timestamp: new Date().toISOString() });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`🚀 LexiGuard API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
