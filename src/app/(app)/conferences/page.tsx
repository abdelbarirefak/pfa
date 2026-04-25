'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ConferenceStatusBadge } from '@/components/ui/status-badge';
import { conferencesApi } from '@/lib/api';
import { formatDate, isDeadlineSoon, daysUntil } from '@/lib/utils';
import type { Conference } from '@/types';
import { BookOpen, Search, MapPin, Calendar, AlarmClock, Loader2 } from 'lucide-react';

export default function ConferencesPage() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [filtered, setFiltered] = useState<Conference[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    conferencesApi
      .list()
      .then((data) => {
        setConferences(data);
        setFiltered(data);
      })
      .catch(() => setConferences([]))
      .finally(() => setLoading(false));
  }, []);

  // Apply filters
  useEffect(() => {
    let result = conferences;
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, conferences]);

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Conferences"
        subtitle="Browse open conferences and submit your research papers."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="conference-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or location…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition"
          />
        </div>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition"
        >
          <option value="ALL">All Statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="OPEN">Open for Submission</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-slate-400">
          Showing {filtered.length} of {conferences.length} conferences
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded">
          <EmptyState
            icon={BookOpen}
            title="No conferences found"
            description={
              search || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filter.'
                : 'No conferences are currently listed. Check back soon.'
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((conf) => {
            const soon = isDeadlineSoon(conf.submissionDeadline);
            const days = daysUntil(conf.submissionDeadline);
            const isPast = days < 0;

            return (
              <div
                key={conf.id}
                className="bg-white border border-slate-200 rounded hover:shadow-sm transition-shadow flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-[#0F1B2D] leading-snug">
                      {conf.name}
                    </h3>
                    <ConferenceStatusBadge status={conf.status} />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{conf.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        {formatDate(conf.startDate)} – {formatDate(conf.endDate)}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 mt-2 ${
                        isPast
                          ? 'text-slate-400'
                          : soon
                          ? 'text-amber-600 font-medium'
                          : 'text-slate-500'
                      }`}
                    >
                      <AlarmClock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Deadline: {formatDate(conf.submissionDeadline)}
                        {!isPast && soon && (
                          <span className="ml-1 text-amber-600">
                            ({days}d left!)
                          </span>
                        )}
                        {isPast && (
                          <span className="ml-1 text-slate-400">(closed)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="px-5 pb-4">
                  {conf.status === 'OPEN' ? (
                    <Link
                      href={`/submissions/new?conferenceId=${conf.id}`}
                      className="block w-full text-center py-2 text-sm font-medium bg-[#0F1B2D] hover:bg-[#1E3A5F] text-white rounded transition-colors"
                    >
                      Submit a Paper
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="block w-full text-center py-2 text-sm font-medium border border-slate-200 text-slate-400 rounded cursor-not-allowed bg-slate-50"
                    >
                      {conf.status === 'UPCOMING' ? 'Not Yet Open' : 'Submissions Closed'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
