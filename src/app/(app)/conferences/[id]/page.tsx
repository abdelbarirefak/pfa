'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { conferencesApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { ConferenceStatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, isDeadlineSoon, daysUntil } from '@/lib/utils';
import type { Conference, Track } from '@/types';
import {
  BookOpen,
  MapPin,
  Calendar,
  AlarmClock,
  ArrowLeft,
  Loader2,
  Hash,
} from 'lucide-react';

export default function ConferenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [conference, setConference] = useState<Conference | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      conferencesApi.getById(id),
      conferencesApi.getTracks(id),
    ])
      .then(([conf, trks]) => {
        setConference(conf);
        setTracks(trks);
      })
      .catch((err) => {
        if ((err as { status?: number })?.status === 404) {
          setNotFound(true);
        }
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

  if (notFound || !conference) {
    return (
      <div className="max-w-3xl">
        <EmptyState
          icon={BookOpen}
          title="Conference not found"
          description="The conference you are looking for does not exist or has been removed."
          action={
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
          }
        />
      </div>
    );
  }

  const soon = isDeadlineSoon(conference.submissionDeadline);
  const days = daysUntil(conference.submissionDeadline);
  const isPast = days < 0;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back link */}
      <Link
        href="/conferences"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Conferences
      </Link>

      {/* Header */}
      <PageHeader
        title={conference.name}
        subtitle={conference.description ?? 'Academic conference'}
      >
        <ConferenceStatusBadge status={conference.status} />
      </PageHeader>

      {/* Meta cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: MapPin,
            label: 'Location',
            value: conference.location,
          },
          {
            icon: Calendar,
            label: 'Dates',
            value: `${formatDate(conference.startDate)} – ${formatDate(conference.endDate)}`,
          },
          {
            icon: AlarmClock,
            label: 'Submission Deadline',
            value: formatDate(conference.submissionDeadline),
            highlight: soon && !isPast,
            muted: isPast,
          },
          {
            icon: Hash,
            label: 'Tracks',
            value: `${tracks.length} track${tracks.length !== 1 ? 's' : ''}`,
          },
        ].map(({ icon: Icon, label, value, highlight, muted }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded p-4"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p
              className={`text-sm font-medium ${
                highlight
                  ? 'text-amber-600'
                  : muted
                  ? 'text-slate-400'
                  : 'text-slate-800'
              }`}
            >
              {value}
              {highlight && (
                <span className="ml-1 text-xs font-normal text-amber-500">
                  ({days}d left)
                </span>
              )}
              {muted && (
                <span className="ml-1 text-xs font-normal text-slate-400">
                  (closed)
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Tracks */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Available Tracks
        </h2>
        {tracks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded">
            <EmptyState
              icon={BookOpen}
              title="No tracks yet"
              description="This conference has no tracks defined. Check back later."
            />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded divide-y divide-slate-100">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-800">
                    {track.name}
                  </span>
                </div>
                {conference.status === 'OPEN' && (
                  <Link
                    href={`/submissions/new?conferenceId=${conference.id}&trackId=${track.id}`}
                    className="text-xs font-medium text-[#0F1B2D] hover:underline"
                  >
                    Submit to this track →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      {conference.status === 'OPEN' && (
        <div className="flex items-center gap-3 p-4 bg-[#0F1B2D] rounded">
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              Submissions are open for this conference
            </p>
            {!isPast && (
              <p className="text-xs text-slate-400 mt-0.5">
                Deadline: {formatDate(conference.submissionDeadline)}
                {soon && ` · Only ${days} day${days !== 1 ? 's' : ''} remaining`}
              </p>
            )}
          </div>
          <Link
            href={`/submissions/new?conferenceId=${conference.id}`}
            className="flex-shrink-0 px-4 py-2 bg-[#B8860B] hover:bg-amber-600 text-white text-sm font-medium rounded transition-colors"
          >
            Submit a Paper
          </Link>
        </div>
      )}
    </div>
  );
}
