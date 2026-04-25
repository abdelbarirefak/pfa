'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { reviewsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Review } from '@/types';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormData {
  comments: string;
  evaluationComments: string;
  recommendation: 'STRONG_ACCEPT' | 'ACCEPT' | 'WEAK_ACCEPT' | 'REJECT' | 'STRONG_REJECT';
}

const RECOMMENDATION_OPTIONS: Array<{
  value: ReviewFormData['recommendation'];
  label: string;
  className: string;
}> = [
  { value: 'STRONG_ACCEPT', label: 'Strong Accept', className: 'text-emerald-700 border-emerald-300 bg-emerald-50' },
  { value: 'ACCEPT', label: 'Accept', className: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
  { value: 'WEAK_ACCEPT', label: 'Weak Accept', className: 'text-amber-700 border-amber-300 bg-amber-50' },
  { value: 'REJECT', label: 'Reject', className: 'text-red-600 border-red-200 bg-red-50' },
  { value: 'STRONG_REJECT', label: 'Strong Reject', className: 'text-red-700 border-red-300 bg-red-50' },
];

interface ReviewFormProps {
  review: Review;
  onSaved: (updated: Review) => void;
}

export function ReviewEvaluationForm({ review, onSaved }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCompleted = review.status === 'COMPLETED';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<ReviewFormData>({
    defaultValues: {
      comments: review.comments ?? '',
      evaluationComments: review.evaluationComments ?? '',
      recommendation: undefined,
    },
  });

  const commentsValue = watch('comments') ?? '';
  const evalValue = watch('evaluationComments') ?? '';

  async function onSubmit(data: ReviewFormData, status: 'IN_PROGRESS' | 'COMPLETED') {
    setIsSubmitting(true);
    try {
      const updated = await reviewsApi.update(review.id, {
        comments: data.comments,
        evaluationComments: `[${data.recommendation}] ${data.evaluationComments}`,
        status,
      });
      toast.success(
        status === 'COMPLETED'
          ? 'Review submitted successfully.'
          : 'Review progress saved.'
      );
      onSaved(updated);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Failed to save review.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCompleted) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-emerald-800">Review Submitted</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            This review has been submitted and is locked for editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6">
      {/* Recommendation */}
      <div>
        <fieldset>
          <legend className="text-sm font-medium text-slate-700 mb-2">
            Recommendation <span className="text-red-500">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDATION_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm font-medium transition-all select-none',
                  opt.className
                )}
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="sr-only"
                  {...register('recommendation', { required: 'Please select a recommendation.' })}
                />
                {opt.label}
              </label>
            ))}
          </div>
          {errors.recommendation && (
            <p className="mt-1 text-xs text-red-500">{errors.recommendation.message}</p>
          )}
        </fieldset>
      </div>

      {/* Summary Comments */}
      <div>
        <div className="flex justify-between mb-1">
          <label htmlFor="review-comments" className="text-sm font-medium text-slate-700">
            Summary Comments for Authors <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-slate-400">{commentsValue.length} chars</span>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          These comments will be shared with the authors. Be constructive and specific.
        </p>
        <textarea
          id="review-comments"
          rows={6}
          placeholder="Summarize the paper's contributions, strengths, weaknesses, and specific suggestions for improvement…"
          className={cn(
            'w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition resize-none',
            errors.comments ? 'border-red-400' : 'border-slate-300'
          )}
          {...register('comments', {
            required: 'Summary comments are required.',
            minLength: { value: 50, message: 'Please provide at least 50 characters of feedback.' },
          })}
        />
        {errors.comments && (
          <p className="mt-1 text-xs text-red-500">{errors.comments.message}</p>
        )}
      </div>

      {/* Confidential evaluation */}
      <div>
        <div className="flex justify-between mb-1">
          <label htmlFor="review-eval" className="text-sm font-medium text-slate-700">
            Confidential Notes for Program Committee
          </label>
          <span className="text-xs text-slate-400">{evalValue.length} chars</span>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          These notes are only visible to the PC Chairs. Optional but encouraged.
        </p>
        <textarea
          id="review-eval"
          rows={4}
          placeholder="Any concerns about ethics, originality, conflict of interest, or additional context for the committee…"
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition resize-none"
          {...register('evaluationComments')}
        />
      </div>

      {/* Confidentiality notice */}
      <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-500">
        <strong>Confidentiality:</strong> This review is conducted under a double-blind process.
        Do not include any information that could identify you. Your identity will not be revealed
        to the authors.
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
        <button
          type="button"
          disabled={isSubmitting || !isDirty}
          onClick={handleSubmit((data) => onSubmit(data, 'IN_PROGRESS'))}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Progress
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit((data) => onSubmit(data, 'COMPLETED'))}
          className="flex items-center gap-1.5 px-5 py-2 bg-[#0F1B2D] hover:bg-[#1E3A5F] text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Final Review
        </button>
      </div>
    </form>
  );
}
