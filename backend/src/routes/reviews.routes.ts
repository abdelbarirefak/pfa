/**
 * routes/reviews.routes.ts — Review route definitions.
 *
 * GET  /api/reviews?reviewerId=  — My assigned reviews
 * GET  /api/reviews/:id          — Get one review
 * PATCH /api/reviews/:id         — Submit/update review
 * POST /api/reviews/assign       — Assign reviewer to paper (PC_CHAIR/ADMIN)
 */

import { Router } from 'express';
import { z } from 'zod';
import { reviewsController } from '../controllers/reviews.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const updateReviewSchema = z.object({
  comments: z.string().max(5000).optional(),
  evaluationComments: z.string().max(5000).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

const assignSchema = z.object({
  paperId: z.string().min(1),
  reviewerId: z.string().min(1),
});

router.use(authenticate);

router.get('/', reviewsController.listMine);
router.get('/:id', reviewsController.getById);
router.patch('/:id', validate({ body: updateReviewSchema }), reviewsController.update);

router.post(
  '/assign',
  requireRole('PC_CHAIR', 'ADMIN'),
  validate({ body: assignSchema }),
  reviewsController.assign
);

export default router;
