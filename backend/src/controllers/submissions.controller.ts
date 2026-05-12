/**
 * controllers/submissions.controller.ts — HTTP handlers for paper submission routes.
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { submissionsService } from '../services/submissions.service';
import { config } from '../config';

export const submissionsController = {
  /**
   * GET /api/submissions?userId=xxx
   */
  async listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query as { userId?: string };
      const uid = userId ?? req.user!.sub;
      const submissions = await submissionsService.listByUser(uid);
      res.json(submissions);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/submissions/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submission = await submissionsService.getById(req.params.id);
      res.json(submission);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/submissions
   * Body: { trackId, conferenceId, title, abstract }
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submission = await submissionsService.create({
        ...req.body,
        userId: req.user!.sub,
      });
      res.status(201).json(submission);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/submissions/:id
   * Body: { title?, abstract?, status? }
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submission = await submissionsService.update(
        req.params.id,
        req.user!.sub,
        req.body
      );
      res.json(submission);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/submissions/:id/authors
   * Body: { authorships: [{ userId, authorSequenceOrder, isCorrespondingAuthor }] }
   */
  async updateAuthors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submission = await submissionsService.updateAuthors(
        req.params.id,
        req.user!.sub,
        req.body.authorships
      );
      res.json(submission);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/submissions/:id/manuscript
   * Multipart: file (PDF, max 20MB)
   */
  async uploadManuscript(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ status: 400, message: 'No file uploaded' });
        return;
      }

      // Build a URL path that can be served statically
      const fileUrl = `/uploads/${req.file.filename}`;

      const submission = await submissionsService.updateManuscriptUrl(
        req.params.id,
        req.user!.sub,
        fileUrl
      );

      res.json(submission);
    } catch (err) {
      next(err);
    }
  },
};
