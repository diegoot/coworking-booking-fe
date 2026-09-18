"use client";

import { useEffect, useRef } from "react";
import type { SessionUser } from "@/lib/schemas/auth";
import { useSessionStore } from "@/lib/store/session";

/**
 * Refills the Zustand session store after a full page load/refresh
 * (Zustand resets on every refresh; the httpOnly cookie doesn't).
 *
 * Can't read the cookie directly here (httpOnly = invisible to client
 * JS, on purpose). Can't read it in the root layout either — that would
 * force ISR/SSG routes to render dynamically. So: a separate Route
 * Handler reads it server-side, this fetches it once on mount.
 *
 * PPR (experimental, not used here) would remove the need for this.
 */
export function SessionHydrator() {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) {
      return;
    }
    hydrated.current = true;

    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data: { user: SessionUser | null }) => {
        useSessionStore.getState().setSession(data.user ?? null);
      })
      .catch(() => {
        useSessionStore.getState().setSession(null);
      });
  }, []);

  return null;
}
