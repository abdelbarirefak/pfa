// ─────────────────────────────────────────────────────────────────────────────
// Domain TypeScript Interfaces — Academic Conference & Paper Management Platform
// ─────────────────────────────────────────────────────────────────────────────

// ── User ─────────────────────────────────────────────────────────────────────

export type UserRole = 'AUTHOR' | 'REVIEWER' | 'PC_CHAIR' | 'ADMIN';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  academicAffiliation: string;
  country?: string;
  biography?: string;
  metaLink?: string; // e.g., Google Scholar URL
  role: UserRole;
}

// ── Conference ────────────────────────────────────────────────────────────────

export type ConferenceStatus = 'UPCOMING' | 'OPEN' | 'CLOSED' | 'ARCHIVED';

export interface Conference {
  id: string;
  name: string;
  location: string;
  startDate: string;          // ISO 8601 date string
  endDate: string;            // ISO 8601 date string
  submissionDeadline: string; // ISO 8601 date string
  status: ConferenceStatus;
  trackCount?: number;
  description?: string;
}

// ── Track ─────────────────────────────────────────────────────────────────────

export interface Track {
  id: string;
  conferenceId: string;
  name: string;
}

// ── Authorship ────────────────────────────────────────────────────────────────

export interface Authorship {
  paperId: string;
  userId: string;
  authorSequenceOrder: number;
  isCorrespondingAuthor: boolean;
  // Denormalised for UI display — populated by API joins:
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'academicAffiliation'>;
}

// ── Paper Submission ──────────────────────────────────────────────────────────

export type SubmissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED';

export interface PaperSubmission {
  id: string;
  trackId: string;
  conferenceId: string;
  title: string;
  abstract: string;
  manuscriptFileUrl?: string;
  status: SubmissionStatus;
  authorshipList: Authorship[];
  // Denormalised for UI display:
  trackName?: string;
  conferenceName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Review ────────────────────────────────────────────────────────────────────

export type ReviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Review {
  id: string;
  paperId: string;
  reviewerId: string;
  comments: string;
  evaluationComments: string;
  status: ReviewStatus;
  // Denormalised for UI display:
  paperTitle?: string;
  conferenceName?: string;
}

// ── API Payloads ──────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  academicAffiliation: string;
  country?: string;
}

export interface CreateSubmissionPayload {
  trackId: string;
  conferenceId: string;
  title: string;
  abstract: string;
}

export interface UpdateSubmissionPayload {
  title?: string;
  abstract?: string;
  status?: SubmissionStatus;
}

export interface UpdateAuthorshipPayload {
  authorships: Array<{
    userId: string;
    authorSequenceOrder: number;
    isCorrespondingAuthor: boolean;
  }>;
}

export interface ApiError {
  message: string;
  status: number;
}
