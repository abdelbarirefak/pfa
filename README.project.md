# AcademicConf — Academic Conference & Paper Management Platform

> A modern frontend for managing academic conferences, paper submissions, and peer reviews.
> Designed to replicate the core workflows of platforms like [IEEE EDAS](https://edas.info/).

---

## Table of Contents

1. [Project Goals](#1-project-goals)
2. [Tech Stack](#2-tech-stack)
3. [Authentication Strategy](#3-authentication-strategy)
4. [Database Schema / ERD Context](#4-database-schema--erd-context)
5. [Core User Flows](#5-core-user-flows)
6. [Project Structure](#6-project-structure)
7. [Getting Started](#7-getting-started)
8. [Environment Variables](#8-environment-variables)
9. [API Contract](#9-api-contract)

---

## 1. Project Goals

- Provide a professional, enterprise-grade UI for academic conferences.
- Allow **Authors** to browse conferences, submit papers through a guided wizard, and track submission status.
- Allow **Reviewers** to view assigned papers and submit structured evaluations.
- Allow **PC Chairs** to manage conferences, tracks, and review assignments.
- Consume a **Java/Jakarta EE REST API** as the backend data source.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Language | **TypeScript** (strict mode) |
| Styling | **Tailwind CSS** + custom academic theme |
| UI Components | **shadcn/ui** (Radix UI primitives, accessible) |
| Form Handling | **React Hook Form** |
| Icons | **Lucide React** |
| Toasts | **Sonner** |
| Drag & Drop | **@hello-pangea/dnd** (author reordering) |
| Backend | Java/Jakarta EE REST API |

### Design Language: "Academic & Enterprise"

- **Color Palette**: Deep Navy (`#0F1B2D`) primary + Crisp White + Slate Grays
- **Accent**: Gold (`#B8860B`) for CTAs and highlights
- **Typography**: Inter (body) + system-ui fallback
- **Corners**: Minimal rounding (`rounded`, `rounded-sm`) — no playful bubbles
- **Feedback**: Sonner toasts for all async operations

---

## 3. Authentication Strategy

> **Simple JWT — No NextAuth.js**

1. User submits credentials to `POST /api/auth/login`.
2. The API returns a `{ token: string, user: User }` payload.
3. The token is stored in **`localStorage`** under the key `acconf_token`.
4. Every subsequent API call includes `Authorization: Bearer <token>` in the request header.
5. The user object is stored in **`localStorage`** under `acconf_user` for UI display.
6. Logout clears both keys and redirects to `/login`.

### Why no NextAuth / httpOnly cookies?
For this prototype phase, simplicity and debuggability are prioritized over production-hardened security. The API handles all authorization logic server-side (role-based access). This can be upgraded later.

---

## 4. Database Schema / ERD Context

The frontend is designed around the following backend data model:

```
users
  ├── UserID (PK, string/UUID)
  ├── FirstName (string)
  ├── LastName (string)
  ├── Email (string, unique)
  ├── PasswordHash (string)        — not exposed to frontend
  ├── AcademicAffiliation (string)
  ├── Country (string)
  ├── Biography (string)
  └── MetaLink (string)           — e.g. Google Scholar URL

conferences
  ├── ConferenceID (PK, string)
  ├── Name (string)
  ├── Location (string)
  ├── StartDate (date)
  ├── EndDate (date)
  └── SubmissionDeadline (date)

tracks
  ├── TrackID (PK, string)
  ├── ConferenceID (FK → conferences)
  └── Name (string)

paper_submissions
  ├── PaperID (PK, string)
  ├── TrackID (FK → tracks)
  ├── Title (string)
  ├── Abstract (string)
  ├── ManuscriptFileURL (string)  — path/URL returned after upload
  └── Status (enum)               — DRAFT | SUBMITTED | UNDER_REVIEW | ACCEPTED | REJECTED

authorships
  ├── AuthorshipID (PK)
  ├── PaperID (FK → paper_submissions)
  ├── UserID (FK → users)
  ├── AuthorSequenceOrder (integer) — determines author order on paper
  └── IsCorrespondingAuthor (boolean)

reviews
  ├── ReviewID (PK, string)
  ├── PaperID (FK → paper_submissions)
  ├── ReviewerID (FK → users)
  ├── Comments (text)
  ├── EvaluationComments (text)
  └── Status (enum)               — PENDING | COMPLETED
```

### Relationships Summary
- A **Conference** has many **Tracks**.
- A **Track** has many **Paper Submissions**.
- A **Paper Submission** has many **Authorships** (ordered list of authors).
- A **Paper Submission** has many **Reviews** (one per assigned reviewer).
- A **User** can be an **Author** (via Authorships) and a **Reviewer** (via Reviews).

---

## 5. Core User Flows

### 5.1 Registration Flow
```
New User → /register
  → Fill: FirstName, LastName, Email, Password, AcademicAffiliation
  → POST /api/auth/register
  → On success → redirect to /login
  → Toast: "Account created! Please log in."
```

### 5.2 Login Flow
```
User → /login
  → Fill: Email, Password
  → POST /api/auth/login
  → Store JWT + user in localStorage
  → Redirect to /dashboard
```

### 5.3 Conference Selection
```
Author → /conferences
  → Browse/Search/Filter conferences
  → Click "Submit a Paper" on a conference card
  → Redirect to /submissions/new?conferenceId=<id>
```

### 5.4 Multi-Step Paper Submission Wizard
```
Step 1: Track Selection & Paper Details
  → Select Conference (pre-filled if ?conferenceId param present)
  → Select Track (dynamically loaded from conference)
  → Enter Title (required, min 10 chars)
  → Enter Abstract (required, min 100 chars)
  → Save as DRAFT → POST /api/submissions (status: DRAFT)

Step 2: Manage Authors
  → Submitting user is pre-added as Author #1 (Corresponding Author)
  → Search for co-authors by email → GET /api/users?email=...
  → Add co-authors to the list
  → Drag to reorder (AuthorSequenceOrder)
  → PATCH /api/submissions/:id/authors

Step 3: File Upload
  → Drag-and-drop or click to upload PDF manuscript (max 20MB)
  → POST /api/submissions/:id/manuscript (multipart/form-data)
  → ManuscriptFileURL saved on paper record

Step 4: Review & Submit
  → Read-only summary of all details
  → PATCH /api/submissions/:id { status: "SUBMITTED" }
  → Toast: "Paper submitted successfully!"
  → Redirect to /dashboard
```

### 5.5 Review Process (Reviewer Role)
```
Reviewer → /reviews
  → See table of assigned papers (paper title, conference, status)
  → Click "Evaluate" on a paper
  → Fill review form: Comments, Evaluation, Decision
  → PATCH /api/reviews/:id { comments, evaluationComments, status: "COMPLETED" }
  → Toast: "Review submitted."
```

---

## 6. Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (fonts, global providers)
│   ├── page.tsx                    # Redirect → /dashboard
│   ├── (auth)/                     # Auth route group (no sidebar)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (app)/                      # Authenticated route group (AppShell)
│       ├── layout.tsx
│       ├── dashboard/page.tsx
│       ├── conferences/page.tsx
│       ├── submissions/
│       │   └── new/page.tsx
│       └── reviews/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── app-shell.tsx
│   └── ui/
│       ├── status-badge.tsx
│       ├── empty-state.tsx
│       ├── page-header.tsx
│       ├── data-table.tsx
│       └── stepper.tsx
│
├── features/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   └── submissions/
│       ├── submission-wizard.tsx
│       ├── step-track-details.tsx
│       ├── step-manage-authors.tsx
│       ├── step-file-upload.tsx
│       └── step-review-submit.tsx
│
├── types/
│   └── index.ts                    # All domain TypeScript interfaces
│
└── lib/
    ├── api.ts                      # Typed fetch wrapper
    ├── auth.ts                     # JWT localStorage helpers
    └── utils.ts                    # cn(), date formatters, status colors
```

---

## 7. Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see section 8)
cp .env.example .env.local

# 3. Run development server
npm run dev

# 4. Open browser
open http://localhost:3000
```

---

## 8. Environment Variables

Create a `.env.local` file in the project root:

```env
# URL of the Java/Jakarta EE REST API backend
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

The `NEXT_PUBLIC_` prefix makes this variable available in the browser (client-side code).

---

## 9. API Contract

All requests to the backend use:
- **Base URL**: `process.env.NEXT_PUBLIC_API_URL`
- **Content-Type**: `application/json` (except file uploads: `multipart/form-data`)
- **Auth**: `Authorization: Bearer <JWT>` on all protected routes

### Key Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create new user account |
| POST | `/auth/login` | Authenticate, returns JWT |
| GET | `/conferences` | List all upcoming conferences |
| GET | `/conferences/:id/tracks` | List tracks for a conference |
| GET | `/users?email=...` | Search users by email (for co-author lookup) |
| POST | `/submissions` | Create new paper submission |
| GET | `/submissions?userId=...` | Get user's submissions |
| PATCH | `/submissions/:id` | Update submission (status, details) |
| PATCH | `/submissions/:id/authors` | Update authorship list |
| POST | `/submissions/:id/manuscript` | Upload manuscript file |
| GET | `/reviews?reviewerId=...` | Get reviewer's assigned papers |
| PATCH | `/reviews/:id` | Submit a review |
