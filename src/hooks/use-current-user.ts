import { useEffect, useState } from 'react';
import { getStoredUser } from '@/lib/auth';
import type { User } from '@/types';

/**
 * useCurrentUser — reads the authenticated user from localStorage.
 *
 * Returns null during SSR and before hydration; hydrates on first render.
 * Does NOT re-render on logout — for reactive auth state, use AuthContext/Zustand instead.
 */
export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return user;
}
