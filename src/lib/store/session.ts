import { create } from "zustand";
import type { SessionUser } from "@/lib/schemas/auth";

interface SessionState {
  session: SessionUser | null;
  setSession: (session: SessionUser | null) => void;
  clearSession: () => void;
}

/**
 * Global client session state. Holds only the non-sensitive fields
 * derived from the session (id, name, role) — never the raw JWT, which
 * lives in an httpOnly cookie inaccessible to client JS. Populated on
 * first load from the server (see `SessionHydrator`) and updated
 * directly by the login form and logout action.
 */
export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}));
