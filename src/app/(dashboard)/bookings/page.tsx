import { Suspense } from "react";
import { getRooms } from "@/lib/data/rooms";
import { BookingsList } from "./bookings-list";
import BookingsListLoading from "./bookings-list-loading";
import { NewBookingPicker } from "./new-booking-picker";

// SSR, no `revalidate` export: protected route, "user-specific, must be
// fresh" per AGENTS.md's rendering strategy table. Freshness is
// achieved via `getMyBookings`'s `"bookings"` tag (see that function's
// comment) rather than literal `no-store`, so the list is isolated
// behind Suspense the same way `/bookings/new`'s availability is.
//
// `getRooms()` (ISR, hourly, same tag as Home) is fetched directly here
// rather than behind its own Suspense boundary, matching Home's own
// top-level fetch — it's cached and fast, not worth a loading skeleton
// for the "New booking" picker.
export default async function BookingsPage() {
  const rooms = await getRooms();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-base-content">
        My bookings
      </h1>

      <div className="mt-4">
        <NewBookingPicker rooms={rooms} />
      </div>

      <div className="mt-6">
        <Suspense fallback={<BookingsListLoading />}>
          <BookingsList />
        </Suspense>
      </div>
    </main>
  );
}
