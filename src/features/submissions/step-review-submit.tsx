'use client';

import { cn, formatDate, getInitials } from '@/lib/utils';
import type { Conference, Track } from '@/types';
import type { TrackDetailsData } from './step-track-details';
import type { AuthorEntry } from './step-manage-authors';
import { FileText, Users, Paperclip, Calendar, MapPin, Star } from 'lucide-react';

interface StepReviewSubmitProps {
  trackDetails: TrackDetailsData;
  authors: AuthorEntry[];
  manuscriptFile: File | null;
  existingFileUrl?: string;
  conference?: Conference;
  track?: Track;
  onEdit: (step: number) => void;
}

interface SectionProps {
  icon: React.ElementType;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

function ReviewSection({ icon: Icon, title, onEdit, children }: SectionProps) {
  return (
    <div className="border border-slate-200 rounded">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-[#0F1B2D] hover:underline font-medium"
        >
          Edit
        </button>
      </div>
      <div className="px-4 py-4 space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  );
}

export function StepReviewSubmit({
  trackDetails,
  authors,
  manuscriptFile,
  existingFileUrl,
  conference,
  track,
  onEdit,
}: StepReviewSubmitProps) {
  const hasFile = manuscriptFile != null || !!existingFileUrl;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
        Please review all details carefully before final submission. Once submitted, you can no
        longer change the manuscript or author list without contacting the PC Chair.
      </div>

      {/* Conference & Track */}
      <ReviewSection icon={Calendar} title="Conference & Track" onEdit={() => onEdit(1)}>
        {conference && (
          <Field
            label="Conference"
            value={
              <span className="flex items-center gap-1.5">
                {conference.name}
                <span className="flex items-center gap-0.5 text-slate-500">
                  <MapPin className="w-3 h-3" />
                  {conference.location}
                </span>
              </span>
            }
          />
        )}
        {conference && (
          <Field
            label="Submission Deadline"
            value={formatDate(conference.submissionDeadline)}
          />
        )}
        {track && <Field label="Track" value={track.name} />}
      </ReviewSection>

      {/* Paper Details */}
      <ReviewSection icon={FileText} title="Paper Details" onEdit={() => onEdit(1)}>
        <Field label="Title" value={<strong>{trackDetails.title}</strong>} />
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Abstract</p>
          <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
            {trackDetails.abstract}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {trackDetails.abstract.length} characters
          </p>
        </div>
      </ReviewSection>

      {/* Authors */}
      <ReviewSection icon={Users} title="Authors" onEdit={() => onEdit(2)}>
        <ul className="space-y-2">
          {authors.map((a) => (
            <li key={a.userId} className="flex items-center gap-3">
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold flex-shrink-0',
                  a.authorSequenceOrder === 1
                    ? 'bg-[#0F1B2D] text-white'
                    : 'bg-slate-200 text-slate-600'
                )}
              >
                {getInitials(a.firstName, a.lastName)}
              </div>
              <div>
                <span className="text-sm text-slate-800">
                  {a.authorSequenceOrder}. {a.firstName} {a.lastName}
                  {a.isCorrespondingAuthor && (
                    <Star className="w-3 h-3 inline ml-1 text-[#B8860B] fill-[#B8860B]" />
                  )}
                </span>
                <p className="text-xs text-slate-500">
                  {a.email} · {a.academicAffiliation}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </ReviewSection>

      {/* Manuscript */}
      <ReviewSection icon={Paperclip} title="Manuscript" onEdit={() => onEdit(3)}>
        {hasFile ? (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-sm text-slate-800">
              {manuscriptFile
                ? manuscriptFile.name
                : existingFileUrl?.split('/').pop()}
            </span>
            {manuscriptFile && (
              <span className="text-xs text-slate-400">
                ({(manuscriptFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-red-500">
            ⚠ No manuscript uploaded. Please go back and upload a PDF.
          </p>
        )}
      </ReviewSection>

      {!hasFile && (
        <p className="text-xs text-red-500 font-medium">
          A manuscript file is required before final submission.
        </p>
      )}
    </div>
  );
}
