/**
 * api.ts — Typed fetch wrapper for the Java/Jakarta EE REST API.
 *
 * Base URL is read from NEXT_PUBLIC_API_URL environment variable.
 * All authenticated requests automatically include the JWT Bearer token.
 */

import { getToken, clearAuth, isTokenExpired } from './auth';
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  User,
  Conference,
  Track,
  PaperSubmission,
  CreateSubmissionPayload,
  UpdateSubmissionPayload,
  UpdateAuthorshipPayload,
  Review,
  ApiError,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

// ── Core fetch wrapper ────────────────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  isFormData?: boolean;
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, isFormData = false } = options;

  const token = getToken();

  // Proactively redirect if the stored token is already expired
  if (token && isTokenExpired()) {
    clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?session=expired';
    }
    throw { message: 'Session expired. Please log in again.', status: 401 } as ApiError;
  }

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body
      ? JSON.stringify(body)
      : undefined,
  });

  if (!response.ok) {
    // 401 Unauthorized — token is missing, expired, or revoked
    if (response.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired';
      }
    }
    let message = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errBody = await response.json();
      message = errBody?.message ?? message;
    } catch {
      // use default message
    }
    const error: ApiError = { message, status: response.status };
    throw error;
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export const authApi = {
  login: (payload: LoginPayload) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: payload }),

  register: (payload: RegisterPayload) =>
    request<User>('/auth/register', { method: 'POST', body: payload }),
};

// ── Conference endpoints ──────────────────────────────────────────────────────

export const conferencesApi = {
  list: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => !!v) as [string, string][]
    ).toString();
    return request<Conference[]>(`/conferences${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => request<Conference>(`/conferences/${id}`),

  getTracks: (conferenceId: string) =>
    request<Track[]>(`/conferences/${conferenceId}/tracks`),
};

// ── Users endpoints (for co-author search) ────────────────────────────────────

export const usersApi = {
  search: (email: string) =>
    request<User[]>(`/users?email=${encodeURIComponent(email)}`),

  getById: (id: string) => request<User>(`/users/${id}`),
};

// ── Submissions endpoints ─────────────────────────────────────────────────────

export const submissionsApi = {
  listMine: (userId: string) =>
    request<PaperSubmission[]>(`/submissions?userId=${userId}`),

  getById: (id: string) => request<PaperSubmission>(`/submissions/${id}`),

  create: (payload: CreateSubmissionPayload) =>
    request<PaperSubmission>('/submissions', { method: 'POST', body: payload }),

  update: (id: string, payload: UpdateSubmissionPayload) =>
    request<PaperSubmission>(`/submissions/${id}`, {
      method: 'PATCH',
      body: payload,
    }),

  updateAuthors: (id: string, payload: UpdateAuthorshipPayload) =>
    request<PaperSubmission>(`/submissions/${id}/authors`, {
      method: 'PATCH',
      body: payload,
    }),

  uploadManuscript: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<PaperSubmission>(`/submissions/${id}/manuscript`, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },
};

// ── Reviews endpoints ─────────────────────────────────────────────────────────

export const reviewsApi = {
  listMine: (reviewerId: string) =>
    request<Review[]>(`/reviews?reviewerId=${reviewerId}`),

  getById: (id: string) => request<Review>(`/reviews/${id}`),

  update: (
    id: string,
    payload: Partial<Pick<Review, 'comments' | 'evaluationComments' | 'status'>>
  ) =>
    request<Review>(`/reviews/${id}`, { method: 'PATCH', body: payload }),
};
