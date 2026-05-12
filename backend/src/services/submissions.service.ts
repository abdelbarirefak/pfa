/**
 * services/submissions.service.ts — Business logic for paper submissions.
 *
 * Implements the full paper submission wizard:
 * - Create DRAFT submission
 * - Update details (title, abstract, status)
 * - Manage authorship list (ordered, with corresponding author)
 * - Upload manuscript file
 */

import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

export interface CreateSubmissionInput {
  trackId: string;
  conferenceId: string;
  title: string;
  abstract: string;
  userId: string; // The submitter (becomes Author #1, Corresponding)
}

export interface UpdateSubmissionInput {
  title?: string;
  abstract?: string;
  status?: string;
}

export interface AuthorshipInput {
  userId: string;
  authorSequenceOrder: number;
  isCorrespondingAuthor: boolean;
}

/** Map a PaperSubmission DB record to the frontend-expected shape */
async function mapSubmission(sub: {
  id: string;
  title: string;
  abstract: string;
  manuscriptFileUrl: string | null;
  status: string;
  trackId: string;
  createdAt: Date;
  updatedAt: Date;
  track: {
    id: string;
    name: string;
    conferenceId: string;
    conference: { id: string; name: string };
  };
  authorships: Array<{
    id: string;
    paperId: string;
    userId: string;
    authorSequenceOrder: number;
    isCorrespondingAuthor: boolean;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      academicAffiliation: string;
    };
  }>;
}) {
  return {
    id: sub.id,
    title: sub.title,
    abstract: sub.abstract,
    manuscriptFileUrl: sub.manuscriptFileUrl ?? undefined,
    status: sub.status,
    trackId: sub.trackId,
    conferenceId: sub.track.conferenceId,
    trackName: sub.track.name,
    conferenceName: sub.track.conference.name,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
    authorshipList: sub.authorships.map((a) => ({
      paperId: a.paperId,
      userId: a.userId,
      authorSequenceOrder: a.authorSequenceOrder,
      isCorrespondingAuthor: a.isCorrespondingAuthor,
      user: a.user,
    })),
  };
}

const SUBMISSION_INCLUDE = {
  track: {
    include: {
      conference: { select: { id: true, name: true } },
    },
  },
  authorships: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          academicAffiliation: true,
        },
      },
    },
    orderBy: { authorSequenceOrder: 'asc' as const },
  },
};

export const submissionsService = {
  /**
   * List submissions for a specific user (as author).
   */
  async listByUser(userId: string) {
    const authorships = await prisma.authorship.findMany({
      where: { userId },
      include: {
        paper: {
          include: SUBMISSION_INCLUDE,
        },
      },
    });

    const papers = authorships.map((a) => a.paper);
    return Promise.all(papers.map(mapSubmission));
  },

  /**
   * Get a single submission by ID.
   */
  async getById(id: string) {
    const sub = await prisma.paperSubmission.findUnique({
      where: { id },
      include: SUBMISSION_INCLUDE,
    });

    if (!sub) {
      throw createError(404, `Submission with ID "${id}" not found`);
    }

    return mapSubmission(sub);
  },

  /**
   * Create a new paper submission as DRAFT.
   * Automatically adds the submitter as Author #1 (Corresponding Author).
   */
  async create(input: CreateSubmissionInput) {
    // Verify track exists
    const track = await prisma.track.findUnique({ where: { id: input.trackId } });
    if (!track) {
      throw createError(404, `Track with ID "${input.trackId}" not found`);
    }

    // Verify conferenceId matches the track's conference
    if (track.conferenceId !== input.conferenceId) {
      throw createError(400, 'Track does not belong to the specified conference');
    }

    const sub = await prisma.paperSubmission.create({
      data: {
        title: input.title,
        abstract: input.abstract,
        status: 'DRAFT',
        trackId: input.trackId,
        authorships: {
          create: {
            userId: input.userId,
            authorSequenceOrder: 1,
            isCorrespondingAuthor: true,
          },
        },
      },
      include: SUBMISSION_INCLUDE,
    });

    return mapSubmission(sub);
  },

  /**
   * Update submission title, abstract, or status.
   */
  async update(id: string, requesterId: string, input: UpdateSubmissionInput) {
    const sub = await prisma.paperSubmission.findUnique({
      where: { id },
      include: { authorships: true },
    });

    if (!sub) {
      throw createError(404, `Submission with ID "${id}" not found`);
    }

    // Check that requester is an author
    const isAuthor = sub.authorships.some((a) => a.userId === requesterId);
    if (!isAuthor) {
      throw createError(403, 'You are not an author of this submission');
    }

    const updated = await prisma.paperSubmission.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.abstract && { abstract: input.abstract }),
        ...(input.status && { status: input.status }),
      },
      include: SUBMISSION_INCLUDE,
    });

    return mapSubmission(updated);
  },

  /**
   * Replace the entire authorship list for a submission.
   */
  async updateAuthors(id: string, requesterId: string, authorships: AuthorshipInput[]) {
    const sub = await prisma.paperSubmission.findUnique({
      where: { id },
      include: { authorships: true },
    });

    if (!sub) {
      throw createError(404, `Submission with ID "${id}" not found`);
    }

    // Check that requester is an author
    const isAuthor = sub.authorships.some((a) => a.userId === requesterId);
    if (!isAuthor) {
      throw createError(403, 'You are not an author of this submission');
    }

    // Validate all user IDs exist
    for (const a of authorships) {
      const user = await prisma.user.findUnique({ where: { id: a.userId } });
      if (!user) {
        throw createError(404, `User with ID "${a.userId}" not found`);
      }
    }

    // Replace all authorships in a transaction
    await prisma.$transaction([
      prisma.authorship.deleteMany({ where: { paperId: id } }),
      prisma.authorship.createMany({
        data: authorships.map((a) => ({
          paperId: id,
          userId: a.userId,
          authorSequenceOrder: a.authorSequenceOrder,
          isCorrespondingAuthor: a.isCorrespondingAuthor,
        })),
      }),
    ]);

    const updated = await prisma.paperSubmission.findUnique({
      where: { id },
      include: SUBMISSION_INCLUDE,
    });

    return mapSubmission(updated!);
  },

  /**
   * Save the uploaded manuscript file URL on the submission.
   */
  async updateManuscriptUrl(id: string, requesterId: string, fileUrl: string) {
    const sub = await prisma.paperSubmission.findUnique({
      where: { id },
      include: { authorships: true },
    });

    if (!sub) {
      throw createError(404, `Submission with ID "${id}" not found`);
    }

    const isAuthor = sub.authorships.some((a) => a.userId === requesterId);
    if (!isAuthor) {
      throw createError(403, 'You are not an author of this submission');
    }

    const updated = await prisma.paperSubmission.update({
      where: { id },
      data: { manuscriptFileUrl: fileUrl },
      include: SUBMISSION_INCLUDE,
    });

    return mapSubmission(updated);
  },
};
