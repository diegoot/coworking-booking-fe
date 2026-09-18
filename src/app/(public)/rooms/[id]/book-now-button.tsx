"use client";

import Link from "next/link";
import { useSessionStore } from "@/lib/store/session";

/**
 * Branches the "Book now" flow per AGENTS.md:
 * - Authenticated: navigate straight to `/bookings/new?room=[id]`.
 * - Not authenticated: send to `/login?redirect=...` so login sends the
 *   user back here on success.
 *
 * Client Component because it needs to read the Zustand session store,
 * which is only available client-side.
 */
export function BookNowButton({ roomId }: { roomId: string }) {
  const isAuthenticated = useSessionStore((state) => state.session !== null);
  const bookNowHref = `/bookings/new?room=${roomId}`;
  const href = isAuthenticated
    ? bookNowHref
    : `/login?redirect=${encodeURIComponent(bookNowHref)}`;

  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
    >
      Book now
    </Link>
  );
}
