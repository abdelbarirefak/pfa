/**
 * auth.ts — Simple JWT authentication helpers using localStorage.
 *
 * Strategy:
 *   - JWT token stored under key `acconf_token`
 *   - User object stored under key `acconf_user`
 *   - All API requests include `Authorization: Bearer <token>`
 */

import type { User } from '@/types';

const TOKEN_KEY = 'acconf_token';
const USER_KEY = 'acconf_user';

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── User helpers ──────────────────────────────────────────────────────────────

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

// ── Session helpers ───────────────────────────────────────────────────────────

export function isAuthenticated(): boolean {
  return !!getToken();
}

/** Clear all auth state (call on logout) */
export function clearAuth(): void {
  removeToken();
  removeStoredUser();
}

/** Persist token + user after successful login */
export function persistAuth(token: string, user: User): void {
  setToken(token);
  setStoredUser(user);
}
