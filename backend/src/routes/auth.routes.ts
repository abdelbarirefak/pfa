/**
 * routes/auth.routes.ts — Auth route definitions.
 *
 * POST /api/auth/register — Create new account
 * POST /api/auth/login    — Authenticate, get JWT
 */

import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  academicAffiliation: z.string().min(1, 'Academic affiliation is required').max(200),
  country: z.string().max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Routes
router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);

export default router;
