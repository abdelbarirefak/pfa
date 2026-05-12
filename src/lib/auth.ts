/**
 * auth.ts — Simple JWT authentication helpers using localStorage + cookies.
 *
 * Strategy:
 *   - JWT token stored under key `acconf_token` (localStorage + cookie)
 *   - User object stored under key `acconf_user` (localStorage only)
 *   - All API requests include `Authorization: Bearer <token>`
 *   - Cookie mirrors the token so Next.js middleware can guard routes SSR
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
  // Mirror in a cookie so the Next.js middleware (Edge runtime) can read it
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax`;
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  // Expire the cookie immediately
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
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

/**
 * Returns true if the stored JWT is expired.
 * Decodes the payload (base64) without verifying the signature.
 * Returns false if there is no token or if the token has no `exp` claim.
 */
export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(atob(payloadB64)) as { exp?: number };
    if (!payload.exp) return false;
    // exp is in seconds; Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
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
