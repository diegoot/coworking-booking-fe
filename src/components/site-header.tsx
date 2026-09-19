"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/actions/logout";
import { useSessionStore } from "@/lib/store/session";

const navLinkClasses =
  "text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50";

const currentPageClasses = "text-sm font-medium text-zinc-900 dark:text-zinc-50";

/**
 * Session-aware nav shared by every route group. Client Component
 * because it reads the Zustand session store to decide whether to show
 * login/register links or the logged-in user's name + logout action.
 *
 * On narrow viewports the nav links collapse behind a hamburger
 * disclosure button; on `md` and up they render inline as before.
 */
export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSessionStore((state) => state.session);
  const clearSession = useSessionStore((state) => state.clearSession);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  async function handleLogout() {
    setIsMenuOpen(false);
    await logout();
    clearSession();
    router.push("/");
    router.refresh();
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  const navLinks = (
    <>
      <Link href="/how-it-works" className={navLinkClasses} onClick={closeMenu}>
        How it works
      </Link>

      {session === undefined ? (
        <div
          className="flex items-center gap-6"
          aria-hidden="true"
          data-testid="session-skeleton"
        >
          <span className="h-4 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <span className="h-8 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ) : session ? (
        <>
          <Link href="/bookings" className={navLinkClasses} onClick={closeMenu}>
            My bookings
          </Link>
          {session.role === "ADMIN" && (
            <Link href="/admin" className={navLinkClasses} onClick={closeMenu}>
              Admin
            </Link>
          )}
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {session.name}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          {pathname === "/login" ? (
            <span aria-current="page" className={currentPageClasses}>
              Log in
            </span>
          ) : (
            <Link href="/login" className={navLinkClasses} onClick={closeMenu}>
              Log in
            </Link>
          )}
          {pathname === "/register" ? (
            <span
              aria-current="page"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
            >
              Sign up
            </span>
          ) : (
            <Link
              href="/register"
              onClick={closeMenu}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Sign up
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto w-full max-w-3xl px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Coworking Booking
          </Link>

          <div className="ml-auto hidden items-center gap-6 md:flex">
            {navLinks}
          </div>

          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="site-header-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="ml-auto flex items-center justify-center rounded-md p-2 text-zinc-700 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-100 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <path d="M6 6L18 18M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div
            id="site-header-menu"
            className="mt-4 flex flex-col items-start gap-4 md:hidden"
          >
            {navLinks}
          </div>
        )}
      </nav>
    </header>
  );
}
