# Architecture Overview

## 1. Application Overview

Drafty is a document workspace for registered users. It provides email/password authentication, an owner-specific document dashboard, document creation and renaming, rich-text editing with autosave, and plain-text import.

## 2. Technology Stack

- **Application:** Next.js App Router, React, and TypeScript.
- **Authentication:** Better Auth with its Prisma adapter.
- **Storage:** Prisma and PostgreSQL, using the PostgreSQL driver adapter.
- **Editor:** Tiptap and its StarterKit.
- **Interface:** Tailwind CSS, shadcn-style components built with Base UI, and Lucide icons. React Hook Form and Zod handle authentication form validation.

## 3. Application Architecture

`src/app` contains pages, the Better Auth API route, and document server actions. `src/components` contains authentication, document, and UI components; `src/lib` holds authentication, database, and import helpers. `prisma/schema.prisma` defines the data model.

Better Auth handles registration, sign-in, sign-out, and sessions through `src/app/api/auth/[...all]/route.ts`. `src/proxy.ts` redirects unauthenticated page requests to login. Document pages and actions also check the session; document reads and updates are scoped to the current owner.

The dashboard creates an empty document through a server action. The client-side Tiptap editor supports headings, bold, italic, underline, and lists. It sends debounced content updates to a server action, displays save status and retry controls, and saves the title separately. Content is stored as Tiptap JSON. Server-side Prisma queries access PostgreSQL through the client in `src/lib/prisma.ts`.

Import accepts non-empty UTF-8 `.txt` files up to 1 MB. The server validates and converts their lines to Tiptap paragraphs, then creates an owned document. The original file is not stored.

## 4. Data Model

`User` owns many `Document` records, each with a title, JSON content, timestamps, and an owner. Deleting an owner cascades to their documents. Better Auth uses `Session` and `Account` records associated with users, plus a `Verification` model.

## 5. Engineering Decisions and Tradeoffs

Better Auth, Prisma, and Tiptap provide established authentication, persistence, and editing building blocks instead of custom implementations. PostgreSQL persists documents and authentication data. The App Router combines pages and server actions in one application, keeping the architecture focused on a usable editing workflow within the assessment time limit.

## 6. Known Limitations and Future Improvements

Document sharing and collaborative editing were deprioritized due to the assessment time constraint.

Sharing could retain document ownership while adding a document-access relationship between users and documents, with permissions enforced in every read and write. Real-time collaboration would require additional synchronization and conflict handling. Import currently supports only plain text; document deletion and export are not implemented. Automated tests currently focus on authentication rather than document workflows. With another 2–4 hours, a realistic priority would be owner-controlled sharing with access checks and targeted authorization tests, or broader document workflow tests and import improvements; real-time collaboration would remain future work.
