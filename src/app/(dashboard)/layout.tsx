import type { ReactNode } from "react";

/**
 * Minimal pass-through layout for the `(dashboard)` route group.
 * `SiteHeader` (rendered above every route group) already provides
 * "My bookings"/"Admin" nav links, and no route in this group currently
 * needs shared chrome beyond that (no sidebar, breadcrumbs, etc.
 * described in AGENTS.md) — revisit once `/admin` (feature 6) actually
 * needs shared structure, not before.
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
