'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { clearAuth, getStoredUser } from '@/lib/auth';
import { getInitials } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  FilePlus,
  ClipboardList,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/conferences', label: 'Conferences', icon: BookOpen },
  { href: '/submissions/new', label: 'New Submission', icon: FilePlus },
  { href: '/reviews', label: 'My Reviews', icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const user = getStoredUser();

  function handleLogout() {
    clearAuth();
    toast.success('Logged out successfully.');
    router.push('/login');
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full bg-[#0F1B2D] text-white transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo area */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded bg-[#B8860B]">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-wide text-white truncate">
            AcademicConf
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-3">
        {user && (
          <div className={cn('flex items-center gap-2.5 mb-2', collapsed && 'justify-center')}>
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#1E3A5F] text-xs font-semibold text-white">
              {getInitials(user.firstName, user.lastName)}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.role}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2.5 w-full px-3 py-2 rounded text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 flex items-center justify-center w-6 h-6 rounded-full bg-[#1E3A5F] border border-white/20 text-white hover:bg-[#0F1B2D] transition-colors z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
