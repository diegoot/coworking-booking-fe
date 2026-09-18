import type { ReactNode } from "react";

/**
 * Minimal pass-through layout for the `(dashboard)` route group.
 * Deliberately no nav/chrome yet — that's deferred to feature 5, once
 * `/bookings` (the "My bookings" list) exists and a real dashboard shell
 * makes sense to build around it.
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
