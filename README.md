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

## Missing

- **End-to-end coverage for the key flows.** Playwright specs today only
  cover Home and the room detail modal — login/redirect-back, creating
  and cancelling a booking, and admin gating are still untested
  end-to-end (unit/component tests do cover them individually).

## Possible improvements

Known gaps, left out of scope on purpose for this portfolio project:

- **Split "My bookings" into past and upcoming.** Everything renders in
  one flat list today.
- **Reject cancelling a past booking on the backend.**
  `DELETE /bookings/:id` doesn't check `endTime` against now — the
  frontend only hides the Cancel button for past bookings (UI-only, not
  enforced).
- **Reject booking an already-expired slot on the backend.**
  `POST /bookings` doesn't check `startTime` against now — the frontend
  only grays out past slots (UI-only, not enforced).
- **Let admins delete rooms.** No `DELETE /rooms/:id` endpoint exists on
  the backend yet.
- **Expose date/room filtering in the admin bookings lookup.** The
  backend's `GET /bookings` already supports `date`/`roomId` filters —
  the frontend only ever passes `userId`.
- **Let a user book a day other than today.** `/bookings/new` has no
  date picker — availability is always for today.
- **Confirm cancellation with a reason.** Cancelling has no confirmation
  step or way to record why.
- **Improve accessibility.** Forms have baseline ARIA
  (`aria-invalid`/`aria-describedby`/`role="alert"`), but coverage isn't
  comprehensive across the app.
- **Improve e2e test coverage** beyond the two flows tested today.
- **Let admins upload a room image.** No `imageUrl` field on `Room`
  yet — room cards/detail show a placeholder icon instead of a real
  photo.
- **Let admins define per-room amenities.** The amenity list (wifi, A/C,
  coffee machine, etc.) shown on the room detail and "New booking" pages
  is hardcoded and identical for every room. Needs backend support for
  an amenity catalog first (see the backend's own Possible improvements);
  on the frontend, this also means a new Admin tab for managing the
  catalog (add/remove available amenities) and letting an admin pick a
  room's amenities from it when creating/editing a room.
