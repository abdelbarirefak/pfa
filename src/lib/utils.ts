import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SubmissionStatus, ReviewStatus, ConferenceStatus } from '@/types';

// ── Tailwind class merging utility ────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date formatters ───────────────────────────────────────────────────────────

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Returns true if the deadline is within the next N days */
export function isDeadlineSoon(isoString: string, withinDays = 7): boolean {
  const deadline = new Date(isoString).getTime();
  const now = Date.now();
  const diff = deadline - now;
  return diff > 0 && diff < withinDays * 24 * 60 * 60 * 1000;
}

/** Returns days remaining until deadline (negative = past) */
export function daysUntil(isoString: string): number {
  const ms = new Date(isoString).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// ── Status color maps ─────────────────────────────────────────────────────────

export const SUBMISSION_STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  ACCEPTED: {
    label: 'Accepted',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

export const REVIEW_STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export const CONFERENCE_STATUS_CONFIG: Record<
  ConferenceStatus,
  { label: string; className: string }
> = {
  UPCOMING: {
    label: 'Upcoming',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  OPEN: {
    label: 'Open',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'bg-slate-50 text-slate-500 border-slate-200',
  },
};

// ── String helpers ─────────────────────────────────────────────────────────────

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncate(str: string, maxLength: number): string {
  return str.length <= maxLength ? str : `${str.slice(0, maxLength)}…`;
}
