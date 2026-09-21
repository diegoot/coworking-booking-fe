import type { Booking } from "@/lib/schemas/booking";
import { formatSlotTime } from "@/lib/utils/format-slot-time";
import { formatBookingDate } from "@/lib/utils/format-booking-date";
import { BookingStatusBadge } from "@/components/booking-status-badge";

/**
 * Read-only row for the admin user-bookings lookup. Deliberately not a
 * reuse of `src/app/(dashboard)/bookings/booking-row.tsx`: that row
 * unconditionally renders a `<CancelButton>`, which doesn't belong in a
 * read-only admin lookup. `roomName` is resolved by the caller
 * (`BookingsLookupResults`) the same way `BookingsList` resolves it for
 * `BookingRow`.
 */
export function AdminBookingRow({
  booking,
  roomName,
}: {
  booking: Booking;
  roomName: string;
}) {
  return (
    <li className="flex flex-col gap-1 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          {roomName}
        </p>
        <BookingStatusBadge status={booking.status} />
      </div>
      <p className="text-zinc-600 dark:text-zinc-400">
        {formatBookingDate(booking.startTime)} &middot;{" "}
        {formatSlotTime(booking.startTime)} &ndash;{" "}
        {formatSlotTime(booking.endTime)}
      </p>
    </li>
  );
}
