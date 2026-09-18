import { cookies } from "next/headers";
import { sessionUserSchema, type SessionUser } from "@/lib/schemas/auth";
import { SESSION_USER_COOKIE } from "@/lib/constants/cookies";

/**
 * Server-only: reads the non-httpOnly `session_user` cookie (set
 * alongside the httpOnly JWT cookie by the login Route Handler) to
 * derive the current session for server-rendered UI — e.g. hydrating
 * the Zustand store on first load in the root layout. This never reads
 * the JWT itself, and its result must never be used to authorize
 * anything: real enforcement happens on the backend (and, from feature
 * 4 onward, in `middleware.ts` reading the httpOnly cookie).
 */
export async function getServerSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_USER_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    const parsed = sessionUserSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
