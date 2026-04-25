'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredUser } from '@/lib/auth';
import { getInitials } from '@/lib/utils';

// Simple breadcrumb mapping
const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  conferences: 'Conferences',
  submissions: 'Submissions',
  new: 'New Submission',
  reviews: 'My Reviews',
};

function getBreadcrumbs(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg) => ROUTE_LABELS[seg] ?? seg);
}

export function Topbar() {
  const pathname = usePathname();
  const user = getStoredUser();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-slate-200 flex-shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-slate-300">/</span>}
            <span
              className={cn(
                i === breadcrumbs.length - 1
                  ? 'text-slate-800 font-medium'
                  : 'text-slate-400'
              )}
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Right area */}
      <div className="flex items-center gap-3">
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5 text-slate-500" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
        </button>

        {user && (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0F1B2D] text-xs font-semibold text-white">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-slate-800 leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-400 leading-none mt-0.5">
                {user.academicAffiliation}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
