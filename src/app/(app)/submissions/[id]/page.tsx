'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { submissionsApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { SubmissionStatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatDateTime, getInitials } from '@/lib/utils';
import type { PaperSubmission } from '@/types';
import {
  FileText,
  ArrowLeft,
  Loader2,
  Clock,
  Paperclip,
  Users,
  Star,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [submission, setSubmission] = useState<PaperSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    submissionsApi
      .getById(id)
      .then(setSubmission)
      .catch((err) => {
        if ((err as { status?: number })?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleWithdraw() {
    if (!submission) return;
    if (!confirm('Are you sure you want to withdraw this submission? This cannot be undone.')) return;
    setWithdrawing(true);
    try {
      await submissionsApi.update(id, { status: 'DRAFT' });
      toast.success('Submission moved back to Draft.');
      setSubmission((prev) => prev ? { ...prev, status: 'DRAFT' } : prev);
    } catch {
      toast.error('Failed to withdraw submission.');
    } finally {
      setWithdrawing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (notFound || !submission) {
    return (
      <div className="max-w-3xl">
        <EmptyState
          icon={FileText}
          title="Submission not found"
          description="This submission does not exist or you do not have access."
          action={
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          }
        />
      </div>
    );
  }

  const isDraft = submission.status === 'DRAFT';
  const isSubmitted = submission.status === 'SUBMITTED';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <PageHeader
        title={submission.title}
        subtitle={`${submission.conferenceName ?? 'Conference'} · ${submission.trackName ?? 'Track'}`}
      >
        <div className="flex items-center gap-2">
          <SubmissionStatusBadge status={submission.status} />
          {isDraft && (
            <Link
              href={`/submissions/new?editId=${submission.id}`}
              className="px-3 py-1.5 text-sm font-medium border border-[#0F1B2D] text-[#0F1B2D] rounded hover:bg-[#0F1B2D] hover:text-white transition-colors"
            >
              Continue Editing
            </Link>
          )}
          {isSubmitted && (
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {withdrawing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Withdraw
            </button>
          )}
        </div>
      </PageHeader>

      {/* Timeline badges */}
      {submission.createdAt && (
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Created {formatDateTime(submission.createdAt)}
          </span>
          {submission.updatedAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last updated {formatDateTime(submission.updatedAt)}
            </span>
          )}
        </div>
      )}

      {/* Abstract */}
      <section className="bg-white border border-slate-200 rounded">
        <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
          <FileText className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700">Abstract</h2>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            {submission.abstract}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {submission.abstract.length} characters
          </p>
        </div>
      </section>

      {/* Authors */}
      {submission.authorshipList && submission.authorshipList.length > 0 && (
        <section className="bg-white border border-slate-200 rounded">
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
            <Users className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700">
              Authors ({submission.authorshipList.length})
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {submission.authorshipList
              .sort((a, b) => a.authorSequenceOrder - b.authorSequenceOrder)
              .map((authorship) => (
                <li
                  key={authorship.userId}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#1E3A5F] text-xs font-semibold text-white">
                    {authorship.user
                      ? getInitials(authorship.user.firstName, authorship.user.lastName)
                      : authorship.authorSequenceOrder}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {authorship.authorSequenceOrder}.{' '}
                      {authorship.user
                        ? `${authorship.user.firstName} ${authorship.user.lastName}`
                        : `Author #${authorship.authorSequenceOrder}`}
                      {authorship.isCorrespondingAuthor && (
                        <Star className="w-3 h-3 inline ml-1.5 text-[#B8860B] fill-[#B8860B]" />
                      )}
                    </p>
                    {authorship.user && (
                      <p className="text-xs text-slate-500">
                        {authorship.user.email} · {authorship.user.academicAffiliation}
                      </p>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* Manuscript */}
      <section className="bg-white border border-slate-200 rounded">
        <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
          <Paperclip className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700">Manuscript</h2>
        </div>
        <div className="px-5 py-4">
          {submission.manuscriptFileUrl ? (
            <a
              href={submission.manuscriptFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#0F1B2D] hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              {submission.manuscriptFileUrl.split('/').pop() ?? 'Download manuscript'}
            </a>
          ) : (
            <p className="text-sm text-slate-500 italic">
              No manuscript uploaded yet.
              {isDraft && (
                <Link
                  href={`/submissions/new?editId=${submission.id}`}
                  className="ml-1 text-[#0F1B2D] hover:underline"
                >
                  Upload one →
                </Link>
              )}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
