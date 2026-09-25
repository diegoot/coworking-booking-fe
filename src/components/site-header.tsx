"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/actions/logout";
import { useSessionStore } from "@/lib/store/session";

const navLinkClasses = "text-sm text-neutral-content/70 hover:text-neutral-content";

const currentPageClasses = "text-sm font-medium text-neutral-content";

/**
 * Renders the current page's own nav item as plain (non-interactive,
 * non-hoverable) text instead of a link back to the page you're
 * already on — same treatment for every nav item, not just login.
 */
function NavLink({
  href,
  pathname,
  onClick,
  children,
}: {
  href: string;
  pathname: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  if (pathname === href) {
    return (
      <span aria-current="page" className={currentPageClasses}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={navLinkClasses} onClick={onClick}>
      {children}
    </Link>
  );
}

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
      <NavLink href="/how-it-works" pathname={pathname} onClick={closeMenu}>
        How it works
      </NavLink>

      {session === undefined ? (
        <div
          className="flex items-center gap-6"
          aria-hidden="true"
          data-testid="session-skeleton"
        >
          <span className="skeleton h-4 w-16" />
          <span className="skeleton h-8 w-20 rounded-md" />
        </div>
      ) : session ? (
        <>
          {session.role !== "ADMIN" && (
            <NavLink href="/bookings" pathname={pathname} onClick={closeMenu}>
              My bookings
            </NavLink>
          )}
          {session.role === "ADMIN" && (
            <NavLink href="/admin" pathname={pathname} onClick={closeMenu}>
              Admin
            </NavLink>
          )}
          <span className="text-sm text-neutral-content/70">
            {session.name}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium text-neutral-content hover:text-neutral-content/80"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <NavLink href="/login" pathname={pathname} onClick={closeMenu}>
            Log in
          </NavLink>
          {pathname === "/register" ? (
            <span
              aria-current="page"
              className="btn btn-disabled btn-sm border-neutral-content/30 bg-transparent text-neutral-content/40"
            >
              Sign up
            </span>
          ) : (
            <Link
              href="/register"
              onClick={closeMenu}
              className="btn btn-primary btn-sm"
            >
              Sign up
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-20 bg-neutral shadow-sm">
      <nav className="navbar mx-auto flex w-full max-w-3xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold text-neutral-content">
          Coworking Booking
        </Link>

        <div className="hidden items-center gap-6 md:flex">{navLinks}</div>

        <div className="md:hidden">
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="site-header-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="btn btn-ghost btn-square text-neutral-content hover:bg-neutral-content/10"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div
            id="site-header-menu"
            className="absolute inset-x-0 top-full z-10 flex w-full flex-col items-start gap-4 bg-neutral px-6 pb-4 shadow-md md:hidden"
          >
            {navLinks}
          </div>
        )}
      </nav>
    </header>
  );
}
