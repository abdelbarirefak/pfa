/**
 * services/reviews.service.ts — Business logic for paper reviews.
 */

import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

export interface UpdateReviewInput {
  comments?: string;
  evaluationComments?: string;
  status?: string;
}

/** Map a Review DB record to the frontend-expected shape */
function mapReview(review: {
  id: string;
  paperId: string;
  reviewerId: string;
  comments: string;
  evaluationComments: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  paper: {
    id: string;
    title: string;
    track: {
      conference: { name: string };
    };
  };
}) {
  return {
    id: review.id,
    paperId: review.paperId,
    reviewerId: review.reviewerId,
    comments: review.comments,
    evaluationComments: review.evaluationComments,
    status: review.status,
    paperTitle: review.paper.title,
    conferenceName: review.paper.track.conference.name,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

const REVIEW_INCLUDE = {
  paper: {
    include: {
      track: {
        include: {
          conference: { select: { name: true } },
        },
      },
    },
  },
};

export const reviewsService = {
  /**
   * List all reviews assigned to a specific reviewer.
   */
  async listByReviewer(reviewerId: string) {
    const reviews = await prisma.review.findMany({
      where: { reviewerId },
      include: REVIEW_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map(mapReview);
  },

  /**
   * Get a single review by ID.
   */
  async getById(id: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: REVIEW_INCLUDE,
    });

    if (!review) {
      throw createError(404, `Review with ID "${id}" not found`);
    }

    return mapReview(review);
  },

  /**
   * Update a review (submit comments and/or change status).
   */
  async update(id: string, requesterId: string, input: UpdateReviewInput) {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw createError(404, `Review with ID "${id}" not found`);
    }

    if (review.reviewerId !== requesterId) {
      throw createError(403, 'You can only update your own reviews');
    }

    if (review.status === 'COMPLETED' && input.status !== 'COMPLETED') {
      throw createError(400, 'Cannot reopen a completed review');
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(input.comments !== undefined && { comments: input.comments }),
        ...(input.evaluationComments !== undefined && { evaluationComments: input.evaluationComments }),
        ...(input.status && { status: input.status }),
      },
      include: REVIEW_INCLUDE,
    });

    return mapReview(updated);
  },

  /**
   * Assign a paper to a reviewer (PC_CHAIR / ADMIN only).
   * Creates a Review record with status PENDING.
   */
  async assign(paperId: string, reviewerId: string) {
    // Verify paper exists
    const paper = await prisma.paperSubmission.findUnique({ where: { id: paperId } });
    if (!paper) {
      throw createError(404, `Paper with ID "${paperId}" not found`);
    }

    // Verify reviewer exists
    const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
    if (!reviewer) {
      throw createError(404, `Reviewer with ID "${reviewerId}" not found`);
    }

    // Check for duplicate assignment
    const existing = await prisma.review.findUnique({
      where: { paperId_reviewerId: { paperId, reviewerId } },
    });
    if (existing) {
      throw createError(409, 'This reviewer is already assigned to this paper');
    }

    const review = await prisma.review.create({
      data: { paperId, reviewerId, status: 'PENDING' },
      include: REVIEW_INCLUDE,
    });

    return mapReview(review);
  },
};
