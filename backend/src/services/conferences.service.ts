/**
 * services/conferences.service.ts — Business logic for conferences and tracks.
 */

import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

export interface CreateConferenceInput {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  description?: string;
  status?: string;
}

export interface CreateTrackInput {
  name: string;
}

/** Map a conference DB record to the frontend-expected shape */
function mapConference(conf: {
  id: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  submissionDeadline: Date;
  status: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  tracks?: { id: string }[];
}) {
  return {
    id: conf.id,
    name: conf.name,
    location: conf.location,
    startDate: conf.startDate.toISOString(),
    endDate: conf.endDate.toISOString(),
    submissionDeadline: conf.submissionDeadline.toISOString(),
    status: conf.status,
    description: conf.description ?? undefined,
    trackCount: conf.tracks?.length,
  };
}

export const conferencesService = {
  /**
   * List all conferences with optional filters.
   */
  async list(params?: { status?: string; search?: string }) {
    const where: Record<string, unknown> = {};

    if (params?.status) {
      where.status = params.status;
    }
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { location: { contains: params.search } },
      ];
    }

    const conferences = await prisma.conference.findMany({
      where,
      include: { tracks: { select: { id: true } } },
      orderBy: { startDate: 'asc' },
    });

    return conferences.map(mapConference);
  },

  /**
   * Get a single conference by ID.
   */
  async getById(id: string) {
    const conference = await prisma.conference.findUnique({
      where: { id },
      include: { tracks: { select: { id: true } } },
    });

    if (!conference) {
      throw createError(404, `Conference with ID "${id}" not found`);
    }

    return mapConference(conference);
  },

  /**
   * Get all tracks for a conference.
   */
  async getTracks(conferenceId: string) {
    // Verify conference exists
    await this.getById(conferenceId);

    const tracks = await prisma.track.findMany({
      where: { conferenceId },
      orderBy: { name: 'asc' },
    });

    return tracks.map((t) => ({
      id: t.id,
      conferenceId: t.conferenceId,
      name: t.name,
    }));
  },

  /**
   * Create a new conference (PC_CHAIR / ADMIN only).
   */
  async create(input: CreateConferenceInput) {
    const conference = await prisma.conference.create({
      data: {
        name: input.name,
        location: input.location,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        submissionDeadline: new Date(input.submissionDeadline),
        description: input.description,
        status: input.status ?? 'UPCOMING',
      },
      include: { tracks: { select: { id: true } } },
    });

    return mapConference(conference);
  },

  /**
   * Add a track to a conference.
   */
  async addTrack(conferenceId: string, input: CreateTrackInput) {
    await this.getById(conferenceId); // ensures conference exists

    const track = await prisma.track.create({
      data: {
        name: input.name,
        conferenceId,
      },
    });

    return { id: track.id, conferenceId: track.conferenceId, name: track.name };
  },
};
