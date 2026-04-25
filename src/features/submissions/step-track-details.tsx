'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { conferencesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Conference, Track } from '@/types';
import { Loader2 } from 'lucide-react';

export interface TrackDetailsData {
  conferenceId: string;
  trackId: string;
  title: string;
  abstract: string;
}

interface StepTrackDetailsProps {
  initial?: Partial<TrackDetailsData>;
  onNext: (data: TrackDetailsData) => void;
  preselectedConferenceId?: string;
}

export function StepTrackDetails({
  initial,
  onNext,
  preselectedConferenceId,
}: StepTrackDetailsProps) {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingConferences, setLoadingConferences] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TrackDetailsData>({
    defaultValues: {
      conferenceId: preselectedConferenceId ?? initial?.conferenceId ?? '',
      trackId: initial?.trackId ?? '',
      title: initial?.title ?? '',
      abstract: initial?.abstract ?? '',
    },
  });

  const selectedConferenceId = watch('conferenceId');
  const abstractValue = watch('abstract') ?? '';

  // Load conferences on mount
  useEffect(() => {
    conferencesApi
      .list({ status: 'OPEN' })
      .then(setConferences)
      .catch(() => setConferences([]))
      .finally(() => setLoadingConferences(false));
  }, []);

  // Load tracks when conference changes
  useEffect(() => {
    if (!selectedConferenceId) {
      setTracks([]);
      setValue('trackId', '');
      return;
    }
    setLoadingTracks(true);
    conferencesApi
      .getTracks(selectedConferenceId)
      .then(setTracks)
      .catch(() => setTracks([]))
      .finally(() => setLoadingTracks(false));
  }, [selectedConferenceId, setValue]);

  return (
    <form id="step1-form" onSubmit={handleSubmit(onNext)} className="space-y-5">
      {/* Conference */}
      <div>
        <label htmlFor="conference-select" className="block text-sm font-medium text-slate-700 mb-1">
          Conference <span className="text-red-500">*</span>
        </label>
        {loadingConferences ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading conferences…
          </div>
        ) : (
          <select
            id="conference-select"
            className={cn(
              'w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition',
              errors.conferenceId ? 'border-red-400' : 'border-slate-300'
            )}
            {...register('conferenceId', { required: 'Please select a conference.' })}
          >
            <option value="">— Select a conference —</option>
            {conferences.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.location})
              </option>
            ))}
          </select>
        )}
        {errors.conferenceId && (
          <p className="mt-1 text-xs text-red-500">{errors.conferenceId.message}</p>
        )}
      </div>

      {/* Track */}
      <div>
        <label htmlFor="track-select" className="block text-sm font-medium text-slate-700 mb-1">
          Track <span className="text-red-500">*</span>
        </label>
        {loadingTracks ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading tracks…
          </div>
        ) : (
          <select
            id="track-select"
            disabled={!selectedConferenceId || tracks.length === 0}
            className={cn(
              'w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition disabled:bg-slate-50 disabled:text-slate-400',
              errors.trackId ? 'border-red-400' : 'border-slate-300'
            )}
            {...register('trackId', { required: 'Please select a track.' })}
          >
            <option value="">
              {!selectedConferenceId
                ? '— Select a conference first —'
                : tracks.length === 0
                ? '— No tracks available —'
                : '— Select a track —'}
            </option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        {errors.trackId && (
          <p className="mt-1 text-xs text-red-500">{errors.trackId.message}</p>
        )}
      </div>

      {/* Paper Title */}
      <div>
        <label htmlFor="paper-title" className="block text-sm font-medium text-slate-700 mb-1">
          Paper Title <span className="text-red-500">*</span>
        </label>
        <input
          id="paper-title"
          type="text"
          placeholder="E.g., A Novel Approach to Distributed Consensus in Byzantine Environments"
          className={cn(
            'w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition',
            errors.title ? 'border-red-400' : 'border-slate-300'
          )}
          {...register('title', {
            required: 'Title is required.',
            minLength: { value: 10, message: 'Title must be at least 10 characters.' },
            maxLength: { value: 300, message: 'Title must be under 300 characters.' },
          })}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Abstract */}
      <div>
        <div className="flex justify-between mb-1">
          <label htmlFor="paper-abstract" className="block text-sm font-medium text-slate-700">
            Abstract <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-slate-400">
            {abstractValue.length} / 3000
          </span>
        </div>
        <textarea
          id="paper-abstract"
          rows={7}
          placeholder="Provide a concise and informative abstract of your paper (min. 100 characters)."
          className={cn(
            'w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition resize-none',
            errors.abstract ? 'border-red-400' : 'border-slate-300'
          )}
          {...register('abstract', {
            required: 'Abstract is required.',
            minLength: { value: 100, message: 'Abstract must be at least 100 characters.' },
            maxLength: { value: 3000, message: 'Abstract must be under 3000 characters.' },
          })}
        />
        {errors.abstract && (
          <p className="mt-1 text-xs text-red-500">{errors.abstract.message}</p>
        )}
      </div>
    </form>
  );
}
