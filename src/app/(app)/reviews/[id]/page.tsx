'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { reviewsApi, submissionsApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { ReviewStatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ReviewEvaluationForm } from '@/features/reviews/review-evaluation-form';
import { truncate } from '@/lib/utils';
import type { Review, PaperSubmission } from '@/types';
import { ClipboardList, ArrowLeft, Loader2, FileText } from 'lucide-react';

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [review, setReview] = useState<Review | null>(null);
  const [paper, setPaper] = useState<PaperSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    reviewsApi
      .getById(id)
      .then(async (rev) => {
        setReview(rev);
        // Load the associated paper for context
        try {
          const p = await submissionsApi.getById(rev.paperId);
          setPaper(p);
        } catch {
          // Paper load is non-critical; continue without it
        }
      })
      .catch((err) => {
        if ((err as { status?: number })?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (notFound || !review) {
    return (
      <div className="max-w-3xl">
        <EmptyState
          icon={ClipboardList}
          title="Review not found"
          description="This review assignment does not exist or you do not have access."
          action={
            <button
              onClick={() => router.push('/reviews')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Reviews
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <Link
        href="/reviews"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Reviews
      </Link>

      {/* Header */}
      <PageHeader
        title="Peer Review Evaluation"
        subtitle={review.conferenceName ?? 'Conference Peer Review'}
      >
        <ReviewStatusBadge status={review.status} />
      </PageHeader>

      {/* Paper context */}
      {paper && (
        <section className="bg-white border border-slate-200 rounded">
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
            <FileText className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700">
              Paper Under Review
            </h2>
            <span className="ml-auto text-xs text-slate-400">
              Double-blind — author identities are hidden
            </span>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Title</p>
              <p className="text-sm font-semibold text-slate-800">{paper.title}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Abstract</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {truncate(paper.abstract, 600)}
              </p>
            </div>
            {paper.manuscriptFileUrl && (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Manuscript</p>
                <a
                  href={paper.manuscriptFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#0F1B2D] hover:underline"
                >
                  Download PDF ↗
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Review form */}
      <section className="bg-white border border-slate-200 rounded">
        <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
          <ClipboardList className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700">Your Evaluation</h2>
        </div>
        <div className="px-5 py-5">
          <ReviewEvaluationForm
            review={review}
            onSaved={(updated) => setReview(updated)}
          />
        </div>
      </section>
    </div>
  );
}
