import { cn, SUBMISSION_STATUS_CONFIG, REVIEW_STATUS_CONFIG, CONFERENCE_STATUS_CONFIG } from '@/lib/utils';
import type { SubmissionStatus, ReviewStatus, ConferenceStatus } from '@/types';

// ── Submission Status Badge ───────────────────────────────────────────────────

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

export function SubmissionStatusBadge({ status, className }: SubmissionStatusBadgeProps) {
  const config = SUBMISSION_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// ── Review Status Badge ───────────────────────────────────────────────────────

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  className?: string;
}

export function ReviewStatusBadge({ status, className }: ReviewStatusBadgeProps) {
  const config = REVIEW_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// ── Conference Status Badge ───────────────────────────────────────────────────

interface ConferenceStatusBadgeProps {
  status: ConferenceStatus;
  className?: string;
}

export function ConferenceStatusBadge({ status, className }: ConferenceStatusBadgeProps) {
  const config = CONFERENCE_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
