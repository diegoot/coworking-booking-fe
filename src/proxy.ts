import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_TOKEN_COOKIE,
  SESSION_USER_COOKIE,
} from "@/lib/constants/cookies";
import { sessionUserSchema } from "@/lib/schemas/auth";
import { isJwtExpired } from "@/lib/utils/jwt";

/**
 * Gates access to the `(dashboard)` route group.
 *
 * Reads the httpOnly `session_token` cookie directly (never the
 * non-httpOnly `session_user` cookie — that one mirrors safe fields for
 * hydrating client-side UI, see `SessionHydrator`, and is not valid for
 * authorization) for the base authentication check below.
 *
 * Checks both the cookie's presence AND the JWT's own `exp` claim
 * (via `isJwtExpired`, unverified — see its own doc comment) so an
 * expired-but-still-present token is caught here, before any page under
 * `/admin` or `/bookings` renders, rather than depending on every
 * individual data-fetching function under those routes to notice a 401
 * from the backend and redirect itself (some, like `getRooms()`, hit
 * public endpoints and never would). This is still not the real
 * authorization boundary — that's the backend's signature verification
 * on every authenticated call — just a UX-level gate that keeps
 * "logged out" consistent across every page in these route groups
 * instead of only the ones whose fetch happens to check.
 *
 * The `/admin` role check further down is the one exception that DOES
 * read `session_user`: role isn't derivable from the JWT here without
 * adding a signature-verifying dependency to the proxy, and `session_user`
 * is the only place that role is already mirrored. This is explicitly a
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

  const sessionToken = request.cookies.get(SESSION_TOKEN_COOKIE)?.value;

  if (!sessionToken || isJwtExpired(sessionToken)) {
    // Mirrors the `?redirect=` shape already used by the unauthenticated
    // "Book now" flow (see `(public)/rooms/[id]/book-now-button.tsx`):
    // encodeURIComponent of the full path + query, consumed by
    // `(auth)/login/page.tsx` via `toSafeRedirect`.
    const target = `${pathname}${request.nextUrl.search}`;
    const loginUrl = new URL(
      `/login?redirect=${encodeURIComponent(target)}`,
      request.url
    );
    const response = NextResponse.redirect(loginUrl);

    // The token is missing or expired, but `session_user` (the readable
    // mirror `SessionHydrator` uses to populate the header) has no
    // expiry of its own and could still be sitting in the browser —
    // clear it here too, so the two cookies can't fall out of sync and
    // leave the header showing a stale logged-in state.
    response.cookies.delete(SESSION_USER_COOKIE);

    return response;
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
