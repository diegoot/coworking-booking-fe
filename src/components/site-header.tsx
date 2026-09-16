import Link from "next/link";

/**
 * Minimal, static nav shared by every route group. Intentionally has no
 * login/session awareness yet — a Zustand-aware version (showing
 * "My bookings" / "Log out" when authenticated) comes with the auth
 * feature.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex w-full max-w-3xl items-center gap-6 px-6 py-4">
        <Link
          href="/"
          className="font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Coworking Booking
        </Link>
        <Link
          href="/how-it-works"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          How it works
        </Link>
      </nav>
    </header>
  );
}
