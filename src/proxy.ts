import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_TOKEN_COOKIE } from "@/lib/constants/cookies";

/**
 * Gates access to the `(dashboard)` route group.
 *
 * Reads the httpOnly `session_token` cookie directly (never the
 * non-httpOnly `session_user` cookie — that one mirrors safe fields for
 * hydrating client-side UI, see `SessionHydrator`, and is not valid for
 * authorization).
 *
 * This only checks for the cookie's presence, not its signature or
 * expiry — real enforcement happens backend-side on every authenticated
 * call. That's intentional (see AGENTS.md / project plan), not an
 * oversight.
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
    // Role check: added in feature 6. Presence-of-cookie check above
    // already gates auth; this block will additionally require the
    // "ADMIN" role once that feature lands.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/bookings/:path*", "/admin/:path*"],
};
