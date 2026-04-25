'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

/**
 * Client-side auth guard for the (app) route group.
 * Redirects to /login if no JWT token is found in localStorage.
 *
 * Note: This runs on the client only (localStorage is unavailable on the server).
 * A server-side middleware.ts would require cookie-based auth.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [router]);

  // Render children optimistically; the redirect fires on the next tick if unauth
  if (typeof window !== 'undefined' && !isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-sm text-slate-400">Redirecting to login…</div>
      </div>
    );
  }

  return <>{children}</>;
}
