import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import contentRoutes from './routes/content.js';
import aiRoutes from './routes/ai.js';
import tokenRoutes from './routes/tokens.js';
import mediaRoutes from './routes/media.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (no auth)
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Auth routes are public (register / login)
app.use('/auth', authRoutes);

// Everything below uses optional JWT auth (falls back to mock admin)
app.use(authMiddleware);

app.use('/content', contentRoutes);
// AI summarize lives under /content/:id/ai/summarize
app.use('/content', aiRoutes);
app.use('/tokens', tokenRoutes);
app.use('/media', mediaRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
