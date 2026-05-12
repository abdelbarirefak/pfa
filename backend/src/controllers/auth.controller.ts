/**
 * controllers/auth.controller.ts — HTTP handlers for authentication routes.
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  /**
   * POST /api/auth/register
   * Body: { firstName, lastName, email, password, academicAffiliation, country? }
   * Returns: User (without passwordHash)
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   * Body: { email, password }
   * Returns: { token: string, user: User }
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
