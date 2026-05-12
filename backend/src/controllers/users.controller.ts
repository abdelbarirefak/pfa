/**
 * controllers/users.controller.ts — HTTP handlers for user routes.
 */

import { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';
import { createError } from '../middleware/errorHandler';

export const usersController = {
  /**
   * GET /api/users?email=partial@email.com
   * Search users by email for co-author lookup.
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.query as { email?: string };
      if (!email) {
        res.json([]);
        return;
      }
      const users = await usersService.searchByEmail(email);
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/users/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.getById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/users/:id
   * Only the authenticated user can update their own profile.
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetId = req.params.id;
      const requesterId = req.user!.sub;

      // Users can only update their own profile (unless ADMIN)
      if (targetId !== requesterId && req.user!.role !== 'ADMIN') {
        return next(createError(403, 'You can only update your own profile'));
      }

      const user = await usersService.updateProfile(targetId, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};
