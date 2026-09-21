# Coworking Booking - Frontend

Frontend for a coworking room booking system. Consumes the Coworking
Booking API (separate repo, Express backend).

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Zustand (global state)
- react-hook-form + Zod (forms, reusing validation schemas where it makes sense)
- Next.js extended fetch (caching/revalidation, not plain native fetch)

## Rendering & routing approach

This project uses a deliberately varied set of Next.js App Router
capabilities — different rendering strategies per route (SSG/ISR/SSR),
route groups, parallel routes, intercepting routes, a proxy, and
Route Handlers — each chosen because it fits the specific requirement of
that part of the app (see the rendering strategy table and feature list
below). When implementing a new route, follow the same reasoning: pick
the approach that fits the route's actual needs, consistent with the
patterns already established in this project.

## Backend

- Base URL configured via `NEXT_PUBLIC_API_URL` (or server-only env var for
  server-side calls)
- Auth: backend issues a JWT on login/register

## Pages / Routes

```
(public)/
  /                          Home — list of room names, "View details" per room
  /rooms/[id]                Room detail (public): capacity, price,
                              "Book now" button. Opens as a modal when
                              navigated to from Home (intercepting route,
                              `(.)rooms/[id]`); direct navigation or a
                              refresh renders it as a full page
  /how-it-works              Static informational page

(auth)/
  /login                     Supports ?redirect= to send the user back
                              to where they were headed after login
  /register

(dashboard)/                 Protected, requires auth
  /bookings                  "My bookings" — list + cancel
  /bookings/new?room=[id]    Availability for the given room + booking
                              form, room preselected via query param
  /admin                     Admin only (role check). Renders @rooms and
                              @bookings simultaneously, each with its own
                              independent loading/error state
    @rooms                   parallel slot: room management (create room)
    @bookings                parallel slot: look up a specific user's
                              bookings by user ID (the backend has no
                              endpoint to list all users or all bookings
                              across users, so this is a manual lookup,
                              not a full roster)
```

### "Book now" flow

- Not authenticated: redirect to `/login?redirect=/bookings/new%3Froom%3D[id]`;
  after a successful login, redirect back to that URL
- Authenticated: navigate directly to `/bookings/new?room=[id]`

### Rendering strategy per route

| Route                     | Strategy | Why |
|----------------------------|----------|-----|
| `/` (Home)                 | ISR (`revalidate: 3600`) | Room list changes rarely |
| `/rooms/[id]`               | ISR (`revalidate: 3600`) | Room name/capacity/price rarely change |
| `/bookings/new` (availability)| SSR (`no-store`), streamed via Suspense — the form shell renders immediately while availability streams in with a skeleton | Protected route; availability is business-sensitive and changes constantly, must be fresh |
| `/how-it-works`            | SSG | No data dependency, pure static content |
| `/bookings`                | SSR | User-specific, must be fresh |
| `/admin` `@bookings`       | SSR (fresh on every request — forced dynamic by reading the session cookie) | Looking up a specific user's bookings must reflect the real current state |
| `/admin` `@rooms`          | ISR (`revalidate: 3600`, same `rooms` tag as Home/`/rooms/[id]`) | Room data changes rarely, like Home; `createRoomAction`'s `updateTag("rooms")` makes new rooms show up immediately regardless of the revalidate window |

## Auth handling

- JWT is stored in an `httpOnly` cookie, set by a Route Handler
  (`app/api/auth/login/route.ts`), not accessible from client JS
- Zustand holds only non-sensitive client state derived from the session
  (e.g. `{ id, name, role }`), not the raw token
- `proxy.ts` (renamed from `middleware.ts` in Next.js 16) reads the cookie
  to gate access to `(dashboard)` routes and checks role for `/admin`
- When redirected to `/login` from a protected action (e.g. "Book now"
  while logged out), the target URL is passed via `?redirect=`
  and the login flow sends the user back there on success

## Mutations

- **Server Actions**: registration, booking creation, booking
  cancellation, room creation (admin), logout — each mutates this app's
  own domain data (or clears its own session cookies) and revalidates
  the relevant path/tag so cached/ISR data stays fresh. Registration
  doesn't touch the session at all (no auto-login), so it's a plain
  domain mutation like the others.
- **Route Handler** (not a Server Action): only login
  (`app/api/auth/login/route.ts`). Login isn't a domain mutation — Next
  acts as a BFF (backend-for-frontend), proxying credentials to the
  external backend and translating its raw JWT response into this app's
  own `httpOnly` session cookie. A Server Action *could* technically set
  that cookie too (`cookies().set()` works there as well), so the
  distinction isn't about capability — it's that a Route Handler is the
  more honest shape for "this is a REST-style auth proxy to another
  service," not "mutate my own data."

## Backend endpoints

```
POST   /auth/register
  body: { name: string, email: string, password: string }

POST   /auth/login
  body: { email: string, password: string }

GET    /rooms
  returns: list of rooms

GET    /rooms/:id/availability?date= (requires auth)
  returns: free/busy slots for that room on that day

GET    /bookings/me                  (requires auth, own bookings only)
  returns: list of the logged-in user's bookings

GET    /bookings/:userId             (admin only)
  returns: list of bookings for the given user

POST   /bookings                     (requires auth)
  body: { roomId: string, startTime: DateTime, endTime: DateTime }

DELETE /bookings/:id                 (booking owner or admin only)

POST   /rooms                        (admin only)
  body: { name: string, capacity: number, pricePerHour: number }
```

## Guidelines

- Feature-based component organization: colocate components with the
  route that owns them; only truly shared UI goes in a top-level
  `components/` or `shared/` folder (see frontend-architect agent for
  details)
- Strict TypeScript typing (tsconfig strict mode)
- Server Components by default; `"use client"` only where interactivity
  is actually needed
- Forms built with react-hook-form + Zod resolvers for client-side
  validation; submission calls a Server Action (see "Mutations" above),
  validating again against the relevant request bodies listed in
  "Backend endpoints"
- Tailwind CSS for all styling, no inline styles
- README with instructions to run the project (env vars needed, npm run dev)
- Testing: Vitest + React Testing Library for unit/component tests,
  Playwright for end-to-end tests

<!--
  The block below is auto-generated by `next dev` itself (Next.js
  16.3.5, installed in this project's node_modules). Source:
  node_modules/next/dist/server/lib/generate-agent-files.js.
-->
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->