/**
 * routes/submissions.routes.ts — Paper submission route definitions.
 *
 * POST  /api/submissions                      — Create (DRAFT)
 * GET   /api/submissions?userId=              — My submissions
 * GET   /api/submissions/:id                  — Get one
 * PATCH /api/submissions/:id                  — Update details/status
 * PATCH /api/submissions/:id/authors          — Update authorship list
 * POST  /api/submissions/:id/manuscript       — Upload PDF file
 */

import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { submissionsController } from '../controllers/submissions.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { config } from '../config';

const router = Router();

// ── Multer config for manuscript upload ───────────────────────────────────────

// Ensure uploads directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `manuscript-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// ── Validation schemas ─────────────────────────────────────────────────────────

const createSchema = z.object({
  trackId: z.string().min(1),
  conferenceId: z.string().min(1),
  title: z.string().min(10, 'Title must be at least 10 characters').max(500),
  abstract: z.string().min(100, 'Abstract must be at least 100 characters').max(5000),
});

const updateSchema = z.object({
  title: z.string().min(10).max(500).optional(),
  abstract: z.string().min(100).max(5000).optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED']).optional(),
});

const updateAuthorsSchema = z.object({
  authorships: z.array(
    z.object({
      userId: z.string().min(1),
      authorSequenceOrder: z.number().int().min(1),
      isCorrespondingAuthor: z.boolean(),
    })
  ).min(1, 'At least one author is required'),
});

// ── Routes ────────────────────────────────────────────────────────────────────

router.use(authenticate);

router.get('/', submissionsController.listMine);
router.get('/:id', submissionsController.getById);

router.post('/', validate({ body: createSchema }), submissionsController.create);
router.patch('/:id', validate({ body: updateSchema }), submissionsController.update);
router.patch('/:id/authors', validate({ body: updateAuthorsSchema }), submissionsController.updateAuthors);
router.post('/:id/manuscript', upload.single('file'), submissionsController.uploadManuscript);

export default router;
