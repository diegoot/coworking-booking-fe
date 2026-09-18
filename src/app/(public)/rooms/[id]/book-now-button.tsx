"use client";

import Link from "next/link";
import { useSessionStore } from "@/lib/store/session";

const buttonClasses =
  "inline-flex w-fit items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";

/**
 * Branches the "Book now" flow per AGENTS.md:
 * - Authenticated: navigate straight to `/bookings/new?room=[id]`.
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
