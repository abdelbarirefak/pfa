/**
 * routes/conferences.routes.ts — Conference route definitions.
 *
 * GET  /api/conferences              — List conferences (filterable)
 * GET  /api/conferences/:id          — Get one conference
 * GET  /api/conferences/:id/tracks   — Get tracks for a conference
 * POST /api/conferences              — Create conference (PC_CHAIR/ADMIN)
 * POST /api/conferences/:id/tracks   — Add track to conference
 */

import { Router } from 'express';
import { z } from 'zod';
import { conferencesController } from '../controllers/conferences.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const conferenceSchema = z.object({
  name: z.string().min(1).max(300),
  location: z.string().min(1).max(300),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  submissionDeadline: z.string().datetime(),
  description: z.string().optional(),
  status: z.enum(['UPCOMING', 'OPEN', 'CLOSED', 'ARCHIVED']).optional(),
});

const trackSchema = z.object({
  name: z.string().min(1).max(200),
});

// All conference routes require authentication
router.use(authenticate);

router.get('/', conferencesController.list);
router.get('/:id', conferencesController.getById);
router.get('/:id/tracks', conferencesController.getTracks);

router.post(
  '/',
  requireRole('PC_CHAIR', 'ADMIN'),
  validate({ body: conferenceSchema }),
  conferencesController.create
);

router.post(
  '/:id/tracks',
  requireRole('PC_CHAIR', 'ADMIN'),
  validate({ body: trackSchema }),
  conferencesController.addTrack
);

export default router;
