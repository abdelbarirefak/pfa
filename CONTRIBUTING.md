# AcademicConf — Developer Guide

This guide documents every file in the project, how it was written, and how to extend it.

---

## Quick Start

```bash
# 1. Clone / open the project
cd "c:\Users\Admin\Documents\Downloads\pfa\app"

# 2. Install dependencies (already done — node_modules present)
npm install

# 3. Configure the API URL
# Edit .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# 4. Start the dev server
npm run dev
# → http://localhost:3000

# 5. Build check (TypeScript strict)
npm run build
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8080/api` | Base URL of the Java/Jakarta EE REST API. The `NEXT_PUBLIC_` prefix makes it available in the browser. |

---

## Project Structure

```
src/
├── types/index.ts         All TypeScript domain interfaces (User, Conference, PaperSubmission, Review, ...)
├── lib/
│   ├── api.ts             Typed fetch wrapper + all API resource groups
│   ├── auth.ts            JWT localStorage helpers (getToken, persistAuth, clearAuth...)
│   └── utils.ts           cn(), date formatters, status badge config maps
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx    Collapsible dark-navy left sidebar
│   │   ├── topbar.tsx     Breadcrumb + user display top bar
│   │   └── app-shell.tsx  Composes sidebar + topbar + main content
│   └── ui/
│       ├── status-badge.tsx   Colored inline pill badges
│       ├── empty-state.tsx    Empty table/list state component
│       ├── page-header.tsx    Page title + action slot header
│       └── stepper.tsx        Horizontal step progress indicator
├── features/
│   ├── auth/
│   │   ├── login-form.tsx     Login with React Hook Form
│   │   └── register-form.tsx  Registration with field validation
│   └── submissions/
│       ├── submission-wizard.tsx   4-step wizard orchestrator (owns all state)
│       ├── step-track-details.tsx  Step 1: Conference/Track + Title + Abstract
│       ├── step-manage-authors.tsx Step 2: DnD author list + user search
│       ├── step-file-upload.tsx    Step 3: PDF dropzone (20 MB max)
│       └── step-review-submit.tsx  Step 4: Read-only review summary
└── app/
    ├── globals.css          Tailwind v4 import + scrollbar + focus styles
    ├── layout.tsx           Root layout: Inter font + Sonner toaster
    ├── page.tsx             Redirect → /dashboard
    ├── (auth)/              Route group: centered card, no sidebar
    │   ├── layout.tsx
    │   ├── login/page.tsx
    │   └── register/page.tsx
    └── (app)/               Route group: AppShell (sidebar + topbar)
        ├── layout.tsx
        ├── dashboard/page.tsx
        ├── conferences/page.tsx
        ├── submissions/new/page.tsx
        └── reviews/page.tsx
```

---

## Authentication

**Strategy: JWT in localStorage — no NextAuth, no server sessions.**

```typescript
import { persistAuth, clearAuth, getToken, getStoredUser, isAuthenticated } from '@/lib/auth';

// After login:
persistAuth(token, user);  // saves to localStorage

// On any page to get the current user:
const user = getStoredUser(); // → User | null

// In API calls (automatic — api.ts does this):
headers['Authorization'] = `Bearer ${getToken()}`;

// On logout:
clearAuth();
router.push('/login');
```

> **Note:** There is currently no route guard middleware. Any unauthenticated user who navigates directly to `/dashboard` will see an empty page (no user). Add `src/middleware.ts` to protect routes.

### Adding route protection (recommended next step)

Create `src/middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('acconf_token')?.value;
  const isPublic = PUBLIC_PATHS.some(p => request.nextUrl.pathname.startsWith(p));
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next|favicon.ico).*)'] };
```
> Note: middleware runs on the server where `localStorage` is unavailable. You'd need to switch to cookies for this approach. The simplest option in the short term is client-side redirect from a `useEffect` in the `(app)` layout.

---

## Adding a New API Endpoint

1. Add the TypeScript types to `src/types/index.ts`
2. Add the function to the appropriate group in `src/lib/api.ts`:

```typescript
export const myResourceApi = {
  list: () => request<MyResource[]>('/my-resource'),
  create: (body: CreatePayload) =>
    request<MyResource>('/my-resource', { method: 'POST', body }),
};
```

---

## Adding a New Page

1. Create the folder: `src/app/(app)/my-page/`
2. Create `page.tsx`:

```typescript
import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = { title: 'My Page' };

export default function MyPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader title="My Page" subtitle="Description here." />
      {/* content */}
    </div>
  );
}
```

3. Add the route to the sidebar in `src/components/layout/sidebar.tsx`:

```typescript
const NAV_ITEMS: NavItem[] = [
  // ... existing items
  { href: '/my-page', label: 'My Page', icon: SomeIcon },
];
```

---

## Adding a New Status Type

1. Add the value to the union type in `src/types/index.ts`
2. Add the config entry in `src/lib/utils.ts`:

```typescript
export const SUBMISSION_STATUS_CONFIG = {
  // Add new entry:
  REVISION_REQUIRED: {
    label: 'Revision Required',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  // ...existing
};
```

The `<SubmissionStatusBadge>` component will automatically pick up the new color.

---

## Dependencies Reference

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.4 | Framework (App Router) |
| `react` | 19.2.4 | UI library |
| `typescript` | ^5 | Type safety |
| `tailwindcss` | ^4 | Utility CSS |
| `lucide-react` | ^1.8.0 | Icon set |
| `react-hook-form` | ^7.73.1 | Form state + validation |
| `@hello-pangea/dnd` | ^18.0.1 | Drag-and-drop (author reordering) |
| `sonner` | ^2.0.7 | Toast notifications |
| `clsx` | ^2.1.1 | Conditional class names |
| `tailwind-merge` | ^3.5.0 | Merge Tailwind classes without conflicts |

---

## Design Tokens (Color Palette)

Use these Tailwind color values / hex codes consistently:

| Role | Hex | Tailwind equivalent |
|---|---|---|
| Primary (Navy Dark) | `#0F1B2D` | Custom (used inline) |
| Primary Hover | `#1E3A5F` | Custom |
| Accent (Gold) | `#B8860B` | Custom |
| Page Background | `#f8fafc` | `slate-50` |
| Card Background | `#ffffff` | `white` |
| Border | `#e2e8f0` | `slate-200` |
| Secondary Text | `#64748b` | `slate-500` |
| Muted Text | `#94a3b8` | `slate-400` |

---

## Known Limitations (v0.1.0)

1. **No route guard** — unauthenticated users can visit `/dashboard` directly
2. **No token expiry handling** — expired JWT will get `401` responses but the UI shows empty data silently
3. **Sidebar state not persisted** — collapse state resets on navigation
4. **No optimistic updates** — all mutations wait for API round-trip before updating UI
5. **No pagination** — all list endpoints fetch all records
