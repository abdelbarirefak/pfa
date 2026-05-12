/**
 * proxy.ts — Server-side route protection for AcademicConf.
 *
 * Runs before each request to protected routes (Next.js 16+ "Proxy" convention,
 * previously called "middleware"). Checks for the `acconf_token` cookie that is
 * written by `lib/auth.ts → setToken()` alongside localStorage.
 *
 * This prevents unauthenticated SSR flicker and protects routes even when
 * JavaScript is disabled on the client.
 *
 * Cookie name: `acconf_token`  (mirrors the localStorage key in auth.ts)
 *
 * Migration note: Next.js 16 renamed `middleware.ts` → `proxy.ts` and the
 * exported function from `middleware()` → `proxy()`. This file is the correct
 * convention for Next.js 16.2.4.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Routes that require authentication */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/conferences',
  '/submissions',
  '/reviews',
];

/** Routes that should redirect already-authenticated users away */
const AUTH_ROUTES = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('acconf_token')?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-authenticated users away from login/register
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static  (static files)
     *   - _next/image   (image optimization)
     *   - favicon.ico
     *   - public folder assets (images, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
