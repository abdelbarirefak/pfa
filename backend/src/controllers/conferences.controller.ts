/**
 * controllers/conferences.controller.ts — HTTP handlers for conference routes.
 */

import { Request, Response, NextFunction } from 'express';
import { conferencesService } from '../services/conferences.service';

export const conferencesController = {
  /**
   * GET /api/conferences?status=OPEN&search=AI
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search } = req.query as { status?: string; search?: string };
      const conferences = await conferencesService.list({ status, search });
      res.json(conferences);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/conferences/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conference = await conferencesService.getById(req.params.id);
      res.json(conference);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/conferences/:id/tracks
   */
  async getTracks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tracks = await conferencesService.getTracks(req.params.id);
      res.json(tracks);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/conferences (PC_CHAIR / ADMIN only)
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conference = await conferencesService.create(req.body);
      res.status(201).json(conference);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/conferences/:id/tracks
   */
  async addTrack(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const track = await conferencesService.addTrack(req.params.id, req.body);
      res.status(201).json(track);
    } catch (err) {
      next(err);
    }
  },
};
