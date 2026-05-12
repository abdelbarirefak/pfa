/**
 * services/users.service.ts — Business logic for user profiles and co-author search.
 */

import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  academicAffiliation?: string;
  country?: string;
  biography?: string;
  metaLink?: string;
}

/** Strip sensitive fields before sending to client */
function sanitizeUser(user: Record<string, unknown>) {
  const { passwordHash: _ph, ...rest } = user;
  return rest;
}

export const usersService = {
  /**
   * Search users by email (for co-author lookup in submission wizard).
   * Returns a list of matching users (partial email match, max 10).
   */
  async searchByEmail(email: string) {
    const users = await prisma.user.findMany({
      where: {
        email: { contains: email },
      },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        academicAffiliation: true,
        role: true,
      },
    });
    return users;
  },

  /**
   * Get a user by ID.
   */
  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw createError(404, `User with ID "${id}" not found`);
    }
    return sanitizeUser(user as Record<string, unknown>);
  },

  /**
   * Update a user's own profile.
   * Only the authenticated user can update their own profile.
   */
  async updateProfile(id: string, input: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw createError(404, `User with ID "${id}" not found`);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(input.firstName && { firstName: input.firstName }),
        ...(input.lastName && { lastName: input.lastName }),
        ...(input.academicAffiliation && { academicAffiliation: input.academicAffiliation }),
        ...(input.country !== undefined && { country: input.country }),
        ...(input.biography !== undefined && { biography: input.biography }),
        ...(input.metaLink !== undefined && { metaLink: input.metaLink }),
      },
    });

    return sanitizeUser(updated as Record<string, unknown>);
  },
};
