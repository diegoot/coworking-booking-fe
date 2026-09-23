# Coworking Booking - Frontend

Frontend for a coworking room booking system. Built with Next.js (App
Router), TypeScript, and Tailwind CSS. Consumes the Coworking Booking
API (separate repo, Express backend).

See [AGENTS.md](./AGENTS.md) for the full spec: routing approach,
rendering strategy per route, auth handling, and backend endpoints.

## Live Demo

**⚠️ Portfolio/demo environment** — not a real production system. Data
resets periodically and credentials below are intentionally public for
reviewers.

- App: https://coworking-booking-fe.vercel.app/
- Backend: hosted on Render's free tier — the first request after a
  period of inactivity may take 30-50s (cold start), which can make the
  first page load feel slow.

### Demo credentials

Admin:

```json
{ "email": "admin@example.com", "password": "Admin1234!" }
```

Sample users (password `password123` for all):

- user1@example.com
- user2@example.com
- user3@example.com

## Requirements

- Node.js 20.9+
- The Coworking Booking API running (see that repo's README)

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with the URL of your running backend.

## Environment variables

Every backend call in this app happens server-side (Server Components,
Server Actions, Route Handlers) — nothing in the browser calls the API
directly, so `NEXT_PUBLIC_API_URL` is not actually read by any client-side
code today despite the `NEXT_PUBLIC_` prefix. It only exists as a fallback
`API_URL` reads if `API_URL` itself is unset.

| Variable | Purpose |
|---|---|
| `API_URL` | Base URL the app's server-side code (Server Components, Server Actions, Route Handlers) uses to reach the backend. Set this. |
| `NEXT_PUBLIC_API_URL` | Fallback used only if `API_URL` is unset. Safe to leave unset if `API_URL` is set. |

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit/component tests (Vitest + React Testing Library) |
| `npm run test:watch` | Run unit/component tests in watch mode |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |

## Deployment notes

- **The backend must be reachable at build time, not only at runtime.**
  Home (`/`) and each room's detail page (`/rooms/[id]`) are ISR —
  `npm run build` tries to prerender them, which means `API_URL` must
  point to a reachable backend during the build step itself, not just
  once the app is running.
- **Production requires HTTPS for login to work.** The session cookies
  (`session_token`, `session_user`) are set with `secure: true` whenever
  `NODE_ENV=production` (`app/api/auth/login/route.ts`) — serving the
  deployed app over plain HTTP means the browser silently drops those
  cookies, and login will appear to succeed but not persist.

## Testing

- **Unit / component tests**: Vitest + React Testing Library, configured
  in `vitest.config.ts` (jsdom environment, setup file at
  `vitest.setup.ts`).
- **End-to-end tests**: Playwright, configured in `playwright.config.ts`.
  `npm run test:e2e` starts the dev server automatically if it isn't
  already running.
