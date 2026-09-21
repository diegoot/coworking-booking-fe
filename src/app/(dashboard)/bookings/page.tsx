import { Suspense } from "react";
import { BookingsList } from "./bookings-list";
import BookingsListLoading from "./bookings-list-loading";

// SSR, no `revalidate` export: protected route, "user-specific, must be
// fresh" per AGENTS.md's rendering strategy table. Freshness is
// achieved via `getMyBookings`'s `"bookings"` tag (see that function's
// comment) rather than literal `no-store`, so the list is isolated
// behind Suspense the same way `/bookings/new`'s availability is.
export default function BookingsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        My bookings
      </h1>

      <div className="mt-6">
        <Suspense fallback={<BookingsListLoading />}>
          <BookingsList />
        </Suspense>
      </div>
    </main>
  );
}
