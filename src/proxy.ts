import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_TOKEN_COOKIE,
  SESSION_USER_COOKIE,
} from "@/lib/constants/cookies";
import { sessionUserSchema } from "@/lib/schemas/auth";

/**
 * Gates access to the `(dashboard)` route group.
 *
 * Reads the httpOnly `session_token` cookie directly (never the
 * non-httpOnly `session_user` cookie — that one mirrors safe fields for
 * hydrating client-side UI, see `SessionHydrator`, and is not valid for
 * authorization) for the base authentication check below.
 *
 * This only checks for the cookie's presence, not its signature or
 * expiry — real enforcement happens backend-side on every authenticated
 * call. That's intentional (see AGENTS.md / project plan), not an
 * oversight.
 *
 * The `/admin` role check further down is the one exception that DOES
 * read `session_user`: role isn't derivable from the JWT here without
 * adding a decode/verify dependency to the proxy, and `session_user` is
 * the only place that role is already mirrored. This is explicitly a
 * UX-level gate only (it avoids rendering the admin shell for non-admins)
 * — it is not the authorization boundary. That boundary is the backend's
 * existing `authenticate + authorize("ADMIN")` middleware on
 * `POST /rooms` and `GET /bookings/:userId`. Someone could forge this
 * cookie client-side and it would change nothing security-wise: the
 * backend independently verifies the JWT and re-fetches the user's real
 * role from its own database on every request.
 *
 * Named/exported as `proxy` (default export) per the Next.js 16 rename
 * from `middleware`.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSessionToken = request.cookies.has(SESSION_TOKEN_COOKIE);

  if (!hasSessionToken) {
    // Mirrors the `?redirect=` shape already used by the unauthenticated
    // "Book now" flow (see `(public)/rooms/[id]/book-now-button.tsx`):
    // encodeURIComponent of the full path + query, consumed by
    // `(auth)/login/page.tsx` via `toSafeRedirect`.
    const target = `${pathname}${request.nextUrl.search}`;
    const loginUrl = new URL(
      `/login?redirect=${encodeURIComponent(target)}`,
      request.url
    );
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    const rawSessionUser = request.cookies.get(SESSION_USER_COOKIE)?.value;

    let parsedSessionUser: unknown;
    try {
      parsedSessionUser = rawSessionUser ? JSON.parse(rawSessionUser) : null;
    } catch {
      // Malformed cookie: treat exactly like "not admin", don't crash
      // the proxy.
      parsedSessionUser = null;
    }

    const sessionUser = sessionUserSchema.safeParse(parsedSessionUser);

    if (!sessionUser.success || sessionUser.data.role !== "ADMIN") {
      // Not `/login`: `hasSessionToken` above already confirms this user
      // is authenticated. Logging in again wouldn't grant them a role
      // they don't have, so `/login` would be misleading here.
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/bookings/:path*", "/admin/:path*"],
};
