"use client";

import { useLayoutEffect, useRef } from "react";
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
 * (Zustand resets on every refresh; the httpOnly JWT cookie doesn't).
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
 * Can't read the cookie in the root layout itself (a Server Component)
 * — that would force ISR/SSG routes to render dynamically. PPR
 * (experimental, not used here) would remove the need for this.
 */
export function SessionHydrator() {
  const hydrated = useRef(false);

  useLayoutEffect(() => {
    if (hydrated.current) {
      return;
    }
    hydrated.current = true;

    useSessionStore.getState().setSession(readSessionCookie());
  }, []);

  return null;
}
