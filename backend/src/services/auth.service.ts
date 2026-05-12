/**
 * services/auth.service.ts — Business logic for authentication.
 *
 * - register: hash password, create user
 * - login: verify credentials, issue JWT
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { createError } from '../middleware/errorHandler';

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  academicAffiliation: string;
  country?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/** Strip passwordHash before sending user to client */
function sanitizeUser(user: { passwordHash: string; [key: string]: unknown }) {
  const { passwordHash: _ph, ...rest } = user;
  return rest;
}

export const authService = {
  /**
   * Register a new user account.
   * Returns the user object without password hash.
   */
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw createError(409, 'A user with this email already exists');
    }

    const SALT_ROUNDS = 12;
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
        academicAffiliation: input.academicAffiliation,
        country: input.country,
        role: 'AUTHOR',
      },
    });

    return sanitizeUser(user);
  },

  /**
   * Authenticate a user.
   * Returns { token, user } on success.
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw createError(401, 'Invalid email or password');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw createError(401, 'Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });

    return {
      token,
      user: sanitizeUser(user),
    };
  },
};
