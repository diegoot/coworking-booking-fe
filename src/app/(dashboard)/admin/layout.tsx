import type { ReactNode } from "react";
import { AdminTabs } from "./admin-tabs";

/**
 * Layout for `/admin`. Declares the `@rooms` and `@bookings` parallel
 * slots (room management, and user-booking lookup by ID — see
 * AGENTS.md), each independently Suspense/error-boundaried by its own
 * slot subtree so one failing doesn't affect the other. `AdminTabs`
 * (client) decides which slot is visible at a time — see its own
 * comment for why this doesn't change how the slots are fetched, and
 * for why it deliberately does NOT read `searchParams` here (layouts
 * never receive that prop) or via `useSearchParams()` (causes a
 * hydration mismatch for this exact use case).
 *
 * No `<h1>Admin</h1>` here: the page is already reached via the
 * header's "Admin" nav link, and the "Admin" label would just repeat
 * itself with nothing else on the page to give it context.
 */
export default function AdminLayout({
  children,
  rooms,
  bookings,
}: {
  children: ReactNode;
  rooms: ReactNode;
  bookings: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      {children}
      <AdminTabs rooms={rooms} bookings={bookings} />
    </main>
  );
}
