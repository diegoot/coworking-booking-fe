import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import type { SessionUser } from "@/lib/schemas/auth";

interface SessionState {
  /**
   * `undefined` = not yet resolved on this page load (the initial
   * state — every fresh JS context starts here, including after a full
   * document reload, since this store isn't persisted). `null` =
   * confirmed logged out. Consumers (`SiteHeader`, `BookNowButton`) must
   * treat `undefined` as its own case, not fold it into "logged out" —
   * that's exactly the distinction that avoids a misleading flash of
   * logged-out UI while `SessionHydrator` resolves the real state.
   */
  session: SessionUser | null | undefined;
  setSession: (session: SessionUser | null) => void;
  clearSession: () => void;
}

const storeCreator: StateCreator<SessionState> = (set) => ({
  session: undefined,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
});

/**
 * Global client session state. Holds only the non-sensitive fields
 * derived from the session (id, name, role) — never the raw JWT, which
 * lives in an httpOnly cookie inaccessible to client JS. Populated on
 * first load from the server (see `SessionHydrator`) and updated
 * directly by the login form and logout action.
 *
 * `devtools` is applied only in development: `NODE_ENV` is a static
 * string at build time, so Next tree-shakes the `devtools`-wrapped
 * branch (and the `zustand/middleware` import along with it) out of the
 * production bundle entirely, rather than shipping dead devtools-wiring
 * code to every visitor.
 */
export const useSessionStore =
  process.env.NODE_ENV === "development"
    ? create<SessionState>()(devtools(storeCreator, { name: "session" }))
    : create<SessionState>(storeCreator);
