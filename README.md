# COA Lab

COA Lab is a focused learning and revision platform for Computer Organization & Architecture. It combines structured chapter notes, working diagrams, progress tracking, practice tests, revision tools, bookmarks, and a streamed AI doubt solver in one Next.js application.

The course currently covers ten chapters, progressing from computer organization fundamentals and data representation through digital logic, ISA, CPU control, pipelining, memory, virtual memory, I/O, and multiprocessors.

## Features

- **Dashboard** – Continue from the last visited chapter and view overall completion, completed chapters, average quiz score, study streak, per-chapter scores, recent activity, and weak topics.
- **Chapter notes** – Read structured sections containing paragraphs, key points, formulas, exam tips, worked examples, tables, and Mermaid diagrams.
- **Chapter progress** – Reading progress is tracked per section. Chapters can be marked complete and resumed later.
- **Practice hub** – Take chapter tests, attempt a timed mock exam, review flashcards, use the formula sheet, and study important questions with model answers and mark allocations.
- **AI Doubt Solver** – Ask questions in Explain, Numerical, Beginner, or Exam mode. Optionally scope a question to a chapter. Responses stream from the server and the conversation can be cleared or retried.
- **Bookmarks** – Save sections and practice questions for later revision.
- **Search** – Use the command palette to search chapters, sections, and key terms. Press `Ctrl+K` on supported desktop layouts.
- **Theme support** – Toggle between light and dark themes; the selected theme is restored before the page paints.
- **Single-user access** – All application routes are protected by a signed, HTTP-only session cookie.

## Course outline

| Chapter | Topic |
| --- | --- |
| 1 | Introduction to Computer Organization & Architecture |
| 2 | Data Representation & Computer Arithmetic |
| 3 | Digital Logic Basics for COA |
| 4 | Instruction Set Architecture & Addressing Modes |
| 5 | CPU Control |
| 6 | Pipelining |
| 7 | Memory |
| 8 | Virtual Memory |
| 9 | I/O |
| 10 | Multiprocessors |

## Tech stack

- Next.js 15 App Router with React 19 and TypeScript
- Tailwind CSS with PostCSS
- Recharts for dashboard charts
- Mermaid for technical diagrams
- React Markdown with GitHub Flavored Markdown support
- Lucide React for interface icons
- xAI Grok Chat Completions API for streamed doubt-solver responses
- Browser `localStorage` for learning progress, chat history, bookmarks, theme, and activity

## Requirements

- Node.js 18.18 or newer (Node.js 20+ is recommended)
- npm
- An xAI API key and model name if the AI Doubt Solver is required

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Edit `.env.local` and set the values described below.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) and sign in with `AUTH_EMAIL` and `AUTH_PASSWORD`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GROK_API_KEY` | For AI | xAI API key used by the server-side doubt-solver route. It is never exposed to the browser. |
| `GROK_MODEL` | For AI | xAI model sent to the Chat Completions API, for example `grok-4.7`. |
| `AUTH_EMAIL` | Yes | Email address accepted by the single-user login flow. It is normalized to lowercase. |
| `AUTH_PASSWORD` | Yes | Password for the single-user account. Use a long, unique value. |
| `AUTH_SECRET` | Yes | Random signing secret used to create and verify session cookies. Use a long random value in production. |

The AI route returns a configuration error when either `GROK_API_KEY` or `GROK_MODEL` is missing. Authentication also cannot work until all three `AUTH_*` variables are set.

Never commit `.env.local` or place provider keys in client-side variables such as `NEXT_PUBLIC_*`.

## npm scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build and run Next.js type/build validation. |
| `npm run start` | Serve the production build. Run `npm run build` first. |

There is currently no test script in `package.json`.

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Progress dashboard and chapter overview |
| `/login` | Single-user sign-in page |
| `/chapters` | All course chapters |
| `/chapters/[slug]` | Notes, diagrams, videos, section progress, and chapter resources |
| `/practice` | Chapter tests, mock exam, flashcards, formulas, and important questions |
| `/doubt` | AI doubt solver |
| `/bookmarks` | Saved sections and questions |
| `/api/auth/login` | Creates a signed session cookie |
| `/api/auth/logout` | Clears the session cookie |
| `/api/auth/session` | Reports the current session state |
| `/api/chat` | Validates a chat request and streams a Grok response |

All routes except `/login`, authentication endpoints, and Next.js static assets are redirected to `/login` when there is no valid session.

## Data and privacy model

COA Lab does not currently use a database. Learning data is stored in the browser that is being used:

- `coa.progress.v1` stores chapter completion, section reading state, quiz attempts, topic results, study days, and recent activity.
- `coa.chat.v1` stores the local doubt-solver conversation.
- Bookmark and theme state are also persisted locally by the client hooks/components.

Clearing site data or switching browsers removes the locally stored learning state. The AI request is sent to the server, which forwards the validated conversation to xAI; provider credentials remain server-side.

## Content authoring

Chapter content is statically defined in [`src/content/chapters/`](./src/content/chapters/). Each chapter exports a `Chapter` object and is registered in [`src/content/chapters/index.ts`](./src/content/chapters/index.ts).

The main content model supports:

- chapter metadata, learning objectives, key terms, and estimated reading time;
- sections containing paragraphs, points, callouts, diagrams, tables, and worked examples;
- optional section or chapter `videoUrl` values;
- flashcards, multiple-choice quiz questions, and important exam questions.

To add or update a chapter, edit or create a file in `src/content/chapters/`, then add it to the `chapters` array in `src/content/chapters/index.ts`. Keep slugs unique and ensure every quiz `answerIndex` points to a valid option. A `videoUrl` can be a YouTube URL or an MP4 URL; when it is absent, the UI shows the video placeholder.

## Project structure

```text
src/
├─ app/                  Next.js pages, layouts, middleware-facing routes, and API handlers
├─ components/           Dashboard, chapter, practice, doubt-solver, layout, and UI components
├─ content/chapters/     The ten statically authored COA chapters
├─ hooks/                localStorage, progress, quiz, bookmark, and hydration helpers
└─ lib/                  Auth, Grok integration, prompts, shared types, and utilities
```

Important implementation boundaries:

- `src/app/api/chat/route.ts` validates messages, limits conversation size, builds the chapter-aware prompt, and streams the provider response.
- `src/lib/grok.ts` is the server-only xAI client.
- `src/lib/auth.ts` signs and verifies seven-day HMAC session cookies.
- `src/hooks/useProgress.ts` defines the client-side progress state and dashboard calculations.
- `src/components/chapter/` contains the chapter reader and progress/bookmark views.
- `src/components/quiz/` contains the test, mock-exam, flashcard, formula, and important-question experiences.

## Production deployment

Build and run the application with:

```bash
npm ci
npm run build
npm run start
```

Configure the same environment variables in the hosting provider before starting the server. Use production-grade values for `AUTH_PASSWORD` and `AUTH_SECRET`, enable HTTPS, and do not expose provider credentials to the client. Because progress and chat history are browser-local, a multi-user deployment still requires a separate persistence/authentication design if users need accounts, synchronization, or cross-device history.

## Troubleshooting

- **Redirected back to login:** verify `AUTH_EMAIL`, `AUTH_PASSWORD`, and `AUTH_SECRET` are present in the server environment and restart the server after changing them.
- **Doubt Solver says Grok is not configured:** set both `GROK_API_KEY` and `GROK_MODEL` in `.env.local`, then restart the development server.
- **AI access denied or rate limited:** check the xAI key permissions, available credits, selected model, and provider rate limits.
- **Progress disappeared:** check whether browser site data was cleared or a different browser/profile is being used.
- **A diagram does not render:** verify the Mermaid syntax in the chapter content and check the browser console for the reported diagram error.
