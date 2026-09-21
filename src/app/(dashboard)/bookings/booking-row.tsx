import type { Booking } from "@/lib/schemas/booking";
import { formatSlotTime } from "@/lib/utils/format-slot-time";
import { formatBookingDate } from "@/lib/utils/format-booking-date";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CancelButton } from "@/components/cancel-button";

/**
 * Server Component: no client state needed here, the whole `(dashboard)`
 * group is already gated by `proxy.ts`, nothing in this row needs
 * Zustand session state.
 */
export function BookingRow({
  booking,
  roomName,
}: {
  booking: Booking;
  roomName: string;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {roomName}
          </p>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {formatBookingDate(booking.startTime)} &middot;{" "}
          {formatSlotTime(booking.startTime)} &ndash;{" "}
          {formatSlotTime(booking.endTime)}
        </p>
      </div>
      {booking.status !== "CANCELLED" && (
        <CancelButton bookingId={booking.id} />
      )}
    </li>
  );
}
