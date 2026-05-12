/**
 * index.ts — AcademicConf REST API Server
 *
 * Configures and starts the Express application:
 * - CORS for the Next.js frontend (localhost:3000)
 * - JSON body parsing
 * - Static file serving for uploaded manuscripts
 * - API routes (auth, conferences, users, submissions, reviews)
 * - Global error handler
 *
 * Listens on PORT (default: 8080) to match NEXT_PUBLIC_API_URL=http://localhost:8080/api
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';

// Route modules
import authRoutes from './routes/auth.routes';
import conferencesRoutes from './routes/conferences.routes';
import usersRoutes from './routes/users.routes';
import submissionsRoutes from './routes/submissions.routes';
import reviewsRoutes from './routes/reviews.routes';

// Middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.corsOrigin.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static Files (uploaded manuscripts) ──────────────────────────────────────
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/conferences', conferencesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/reviews', reviewsRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ status: 404, message: 'Route not found' });
});

// ── Global Error Handler (MUST be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║       AcademicConf API Server — Running           ║');
  console.log('╠═══════════════════════════════════════════════════╣');
  console.log(`║  URL:   http://localhost:${config.port}/api               ║`);
  console.log(`║  Env:   ${config.nodeEnv.padEnd(42)}║`);
  console.log(`║  DB:    SQLite (${config.databaseUrl.padEnd(33)}║`);
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('');
});

export default app;
