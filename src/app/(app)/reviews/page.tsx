'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ReviewStatusBadge } from '@/components/ui/status-badge';
import { reviewsApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { truncate } from '@/lib/utils';
import type { Review } from '@/types';
import { ClipboardList, ExternalLink, Loader2 } from 'lucide-react';

export default function ReviewsPage() {
  const user = getStoredUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    reviewsApi
      .listMine(user.id)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pending = reviews.filter((r) => r.status !== 'COMPLETED');
  const completed = reviews.filter((r) => r.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      <PageHeader
        title="My Reviews"
        subtitle="Papers assigned to you for peer review."
      />

      {reviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded">
          <EmptyState
            icon={ClipboardList}
            title="No reviews assigned"
            description="You have no papers assigned for peer review at this time. Check back later."
          />
        </div>
      ) : (
        <>
          {/* Pending Reviews */}
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                Pending Reviews ({pending.length})
              </h2>
              <div className="bg-white border border-slate-200 rounded overflow-hidden">
                <ReviewTable reviews={pending} />
              </div>
            </section>
          )}

          {/* Completed Reviews */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                Completed Reviews ({completed.length})
              </h2>
              <div className="bg-white border border-slate-200 rounded overflow-hidden">
                <ReviewTable reviews={completed} />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ReviewTable({ reviews }: { reviews: Review[] }) {
  return (
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
              {truncate(rev.paperTitle ?? 'Unknown Paper', 65)}
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
  );
}
