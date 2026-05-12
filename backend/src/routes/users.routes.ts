/**
 * routes/users.routes.ts — User route definitions.
 *
 * GET   /api/users?email=  — Search users by email (co-author lookup)
 * GET   /api/users/:id     — Get user profile
 * PATCH /api/users/:id     — Update own profile
 */

import { Router } from 'express';
import { z } from 'zod';
import { usersController } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  academicAffiliation: z.string().min(1).max(200).optional(),
  country: z.string().max(100).optional(),
  biography: z.string().max(2000).optional(),
  metaLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

router.use(authenticate);

router.get('/', usersController.search);
router.get('/:id', usersController.getById);
router.patch('/:id', validate({ body: updateProfileSchema }), usersController.updateProfile);

export default router;
