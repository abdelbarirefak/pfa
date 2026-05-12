/**
 * controllers/reviews.controller.ts — HTTP handlers for review routes.
 */

import { Request, Response, NextFunction } from 'express';
import { reviewsService } from '../services/reviews.service';

export const reviewsController = {
  /**
   * GET /api/reviews?reviewerId=xxx
   */
  async listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reviewerId } = req.query as { reviewerId?: string };
      const rid = reviewerId ?? req.user!.sub;
      const reviews = await reviewsService.listByReviewer(rid);
      res.json(reviews);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/reviews/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewsService.getById(req.params.id);
      res.json(review);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/reviews/:id
   * Body: { comments?, evaluationComments?, status? }
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewsService.update(
        req.params.id,
        req.user!.sub,
        req.body
      );
      res.json(review);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/reviews/assign (PC_CHAIR / ADMIN)
   * Body: { paperId, reviewerId }
   */
  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewsService.assign(req.body.paperId, req.body.reviewerId);
      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  },
};
