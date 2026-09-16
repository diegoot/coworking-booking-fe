# Coworking Booking - Frontend

Frontend for a coworking room booking system. Built with Next.js (App
Router), TypeScript, and Tailwind CSS. Consumes the Coworking Booking
API (separate repo, Express backend).

See [AGENTS.md](./AGENTS.md) for the full spec: routing approach,
rendering strategy per route, auth handling, and backend endpoints.

## Requirements

- Node.js 20+
- The Coworking Booking API running (see that repo's README)

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with the URL of your running backend.

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Client Components | Base URL of the backend API, exposed to the browser |
| `API_URL` | Server Components, Server Actions, Route Handlers | Server-only base URL of the backend API (can point to an internal address, e.g. inside Docker) |

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

## Testing

- **Unit / component tests**: Vitest + React Testing Library, configured
  in `vitest.config.ts` (jsdom environment, setup file at
  `vitest.setup.ts`).
- **End-to-end tests**: Playwright, configured in `playwright.config.ts`.
  `npm run test:e2e` starts the dev server automatically if it isn't
  already running.
