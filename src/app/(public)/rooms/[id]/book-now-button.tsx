"use client";

import Link from "next/link";
import { useSessionStore } from "@/lib/store/session";

const buttonClasses = "btn btn-primary w-fit";

/**
 * Branches the "Book now" flow per AGENTS.md:
 * - Authenticated, not an admin: navigate straight to
 *   `/bookings/new?room=[id]`.
 * - Authenticated as ADMIN: renders nothing. Admin is an operational
 *   role (manages rooms, looks up other users' bookings), not a
 *   coworking member — it doesn't book rooms for itself.
 * - Not authenticated: send to `/login?redirect=...` so login sends the
 *   user back here on success.
 * - Session not yet resolved (`undefined` — see `lib/store/session.ts`):
 *   render a disabled-looking placeholder rather than guessing, since
 *   this page (`/rooms/[id]`) is ISR and the real session is only known
 *   after `SessionHydrator` resolves client-side.
 *
 * Client Component because it needs to read the Zustand session store,
 * which is only available client-side.
 */
export function BookNowButton({ roomId }: { roomId: string }) {
  const session = useSessionStore((state) => state.session);

  if (session === undefined) {
    return (
      <span
        aria-hidden="true"
        className={`${buttonClasses} pointer-events-none opacity-50`}
      >
        Book now
      </span>
    );
  }

  if (session?.role === "ADMIN") {
    return null;
  }

  const bookNowHref = `/bookings/new?room=${roomId}`;
  const href = session
    ? bookNowHref
    : `/login?redirect=${encodeURIComponent(bookNowHref)}`;

  return (
    <Link href={href} className={buttonClasses}>
      Book now
    </Link>
  );
}
