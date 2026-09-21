import type { Booking } from "@/lib/schemas/booking";
import { formatSlotTime } from "@/lib/utils/format-slot-time";
import { formatBookingDate } from "@/lib/utils/format-booking-date";
import { isBookingPast } from "@/lib/utils/is-booking-past";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CancelButton } from "@/components/cancel-button";

/**
 * Row for the admin user-bookings lookup. Not a reuse of
 * `src/app/(dashboard)/bookings/booking-row.tsx` since the layout differs
 * (compact, no `sm:flex-row` split), but it does share `CancelButton`
 * with it: the backend's `DELETE /bookings/:id` already allows "booking
 * owner or admin only", so an admin can cancel any user's booking here
 * the same way a user cancels their own from "my bookings". `roomName`
 * is resolved by the caller (`BookingsLookupResults`) the same way
 * `BookingsList` resolves it for `BookingRow`.
 */
export function AdminBookingRow({
  booking,
  roomName,
}: {
  booking: Booking;
  roomName: string;
}) {
  return (
    <li className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
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
      </div>
      {booking.status !== "CANCELLED" && !isBookingPast(booking) && (
        <CancelButton bookingId={booking.id} />
      )}
    </li>
  );
}
