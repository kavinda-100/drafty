# CollabDocs - Ajaia AI-Native Full Stack Developer Assessment

## 1. Project Overview

CollabDocs is a lightweight, full-stack document editing application inspired by Google Docs, developed as part of Ajaia's AI-Native Full Stack Developer Assessment.

The application focuses on document creation, rich-text editing, persistence, and file importing, with an emphasis on usability and practical engineering decisions under a limited development timeframe.

## 2. Live Application

- **Live URL:** [Drafty Live](https://drafty-tan.vercel.app/)
- **Source Code:** [Drafty](https://github.com/kavinda-100/drafty)
- **Walkthrough Video:** See `VIDEO_URL.txt`

### Test Accounts

- see `README.md` for instructions on creating a test account using Better Auth.

Alternatively, reviewers can register their own account.

## 3. Implemented Features

- Email/password authentication using Better Auth.
- Document creation and renaming.
- Rich-text editing using Tiptap, including basic formatting.
- Persistent document storage using PostgreSQL and Prisma.
- Saving and reopening previously created documents.
- Plain-text (`.txt`) file import into editable documents.
- Basic form validation and error handling, where implemented.

## 4. Known Limitations

Document sharing and real-time collaboration were not implemented due to the assessment's time constraints.

The current version focuses on delivering a reliable, end-to-end document editing experience.

With an additional 2–4 hours, I would prioritize:

1. Implementing document sharing between registered users.
2. Adding server-side access controls and owned/shared document views.
3. Expanding automated test coverage.
4. Improving editor usability and document management.

## 5. Technology Stack

- Next.js (App Router)
- TypeScript
- Better Auth
- Prisma ORM
- PostgreSQL
- Tiptap

## 6. Submission Contents

| File | Description |
|---|---|
| `README.md` | Project setup, environment configuration, and local run instructions |
| `ARCHITECTURE.md` | Architecture, data model, engineering decisions, and tradeoffs |
| `AI_WORKFLOW.md` | AI tools, development process, human review, and verification |
| `SUBMISSION.md` | Submission overview, functionality, limitations, and deliverables |
| `VIDEO_URL.txt` | Link to the 3–5 minute walkthrough video |

## 7. Verification

- **Authentication:** Verified
- **Document creation and renaming:** Verified
- **Rich-text editing and persistence:** Verified
- **TXT file importing:** Verified
- **Automated tests:** Verified
- **Production deployment:** Verified

Refer to `README.md` for local setup and run instructions.