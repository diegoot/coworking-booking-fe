"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { sessionUserSchema } from "@/lib/schemas/auth";
import { SESSION_USER_COOKIE } from "@/lib/constants/cookies";
import { useSessionStore } from "@/lib/store/session";

function readSessionCookie() {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SESSION_USER_COOKIE}=`));
  if (!match) {
    return null;
  }

  try {
    const raw = decodeURIComponent(match.slice(SESSION_USER_COOKIE.length + 1));
    const parsed = sessionUserSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Refills the Zustand session store after a full page load/refresh
 * (Zustand resets on every refresh; the httpOnly JWT cookie doesn't),
 * and re-syncs it on every client-side navigation.
 *
 * The JWT itself is httpOnly and invisible to client JS, on purpose —
 * but `SESSION_USER_COOKIE` (the safe `{id,name,role}` mirror, set
 * alongside it by the login Route Handler) is deliberately NOT httpOnly,
 * specifically so it can be read directly here instead of round-
 * tripping through a Route Handler. Runs in `useLayoutEffect`, not
 * `useEffect`: it fires before the browser paints, so the initial
 * `session: undefined` state (which matches the server-rendered HTML,
 * since the server never knows the visitor's cookie for ISR/SSG routes)
 * resolves to the real value before anything visible commits, instead
 * of flashing a wrong state first.
 *
 * Re-runs on every `pathname` change, not just once on mount: `proxy.ts`
 * redirects to `/login` when `session_token` is missing, and that
 * redirect is a client-side transition (no full document reload), so a
 * one-time hydration would leave the header showing the stale logged-in
 * state after landing on `/login` even though the session is gone.
 *
 * Also force-clears `session_user` whenever we land on `/login`: a
 * couple of data-fetching functions (`getUsers`, `getBookingsForUser`)
 * redirect here from inside a Server Component render when the backend
 * rejects an expired JWT with 401 — `proxy.ts` only checks the session
 * cookie's presence, not its expiry, so it doesn't catch this case.
 * Cookies can't be written during a Server Component render (only from
 * a Server Action, Route Handler, or middleware), so nothing clears
 * `session_user` on that path; doing it here instead works because it's
 * not httpOnly, so client JS can delete it directly. Being on `/login`
 * always means "treat this visitor as logged out" for header purposes,
 * regardless of what a stale cookie says.
 *
 * Can't read the cookie in the root layout itself (a Server Component)
 * — that would force ISR/SSG routes to render dynamically. PPR
 * (experimental, not used here) would remove the need for this.
 */
export function SessionHydrator() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname === "/login") {
      document.cookie = `${SESSION_USER_COOKIE}=; Max-Age=0; path=/`;
      useSessionStore.getState().setSession(null);
      return;
    }

    useSessionStore.getState().setSession(readSessionCookie());
  }, [pathname]);

  return null;
}
