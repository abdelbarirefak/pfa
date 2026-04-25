'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { SubmissionStatusBadge, ReviewStatusBadge } from '@/components/ui/status-badge';
import { submissionsApi, reviewsApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { formatDate, truncate } from '@/lib/utils';
import type { PaperSubmission, Review } from '@/types';
import { FileText, ClipboardList, Plus, Loader2, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  const user = getStoredUser();
  const [submissions, setSubmissions] = useState<PaperSubmission[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      submissionsApi.listMine(user.id).catch(() => [] as PaperSubmission[]),
      reviewsApi.listMine(user.id).catch(() => [] as Review[]),
    ]).then(([subs, revs]) => {
      setSubmissions(subs);
      setReviews(revs);
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? 'Researcher'}`}
        subtitle="Here is an overview of your active submissions and pending reviews."
      >
        <Link
          href="/submissions/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0F1B2D] hover:bg-[#1E3A5F] text-white text-sm font-medium rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Submission
        </Link>
      </PageHeader>

      {/* ── Active Submissions ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Active Submissions
          </h2>
          <span className="text-xs text-slate-400">{submissions.length} total</span>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded">
            <EmptyState
              icon={FileText}
              title="No active submissions"
              description="You haven't submitted any papers yet. Start by browsing open conferences."
              action={
                <Link
                  href="/conferences"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                >
                  Browse Conferences
                </Link>
              }
            />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Paper Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                    Conference
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Track
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                    Updated
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {truncate(sub.title, 60)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                      {sub.conferenceName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                      {sub.trackName ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <SubmissionStatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">
                      {sub.updatedAt ? formatDate(sub.updatedAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/submissions/${sub.id}`}
                        className="inline-flex items-center gap-1 text-xs text-[#0F1B2D] hover:underline"
                      >
                        View
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Pending Reviews ────────────────────────────────────────────────── */}
      {(user?.role === 'REVIEWER' || user?.role === 'PC_CHAIR' || reviews.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Assigned Reviews
            </h2>
            <span className="text-xs text-slate-400">
              {reviews.filter((r) => r.status !== 'COMPLETED').length} pending
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded">
              <EmptyState
                icon={ClipboardList}
                title="No reviews assigned"
                description="You have no papers assigned for review at this time."
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Paper Title
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      Conference
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {truncate(rev.paperTitle ?? 'Unknown Paper', 60)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                        {rev.conferenceName ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <ReviewStatusBadge status={rev.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/reviews/${rev.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#0F1B2D] hover:underline"
                        >
                          {rev.status === 'COMPLETED' ? 'View' : 'Evaluate'}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
