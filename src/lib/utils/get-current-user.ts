import { cookies } from "next/headers";
import { SESSION_USER_COOKIE } from "@/lib/constants/cookies";
import { sessionUserSchema, type SessionUser } from "@/lib/schemas/auth";

/**
 * Server-only: reads the non-httpOnly `session_user` cookie (the safe
 * `{id,name,role}` mirror set alongside the JWT by the login Route
 * Handler — see `SessionHydrator` for the client-side equivalent).
 * Same "not valid for authorization" caveat as `proxy.ts`'s own read of
 * this cookie: it's fine for UX-level decisions (e.g. excluding the
 * admin's own id from a picker), but never for access control — that's
 * always the backend re-deriving the user from the verified JWT.
 * Returns `null` on a missing or malformed cookie instead of throwing.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
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
