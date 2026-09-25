import type { Booking } from "@/lib/schemas/booking";
import { formatSlotTime } from "@/lib/utils/format-slot-time";
import { formatBookingDate } from "@/lib/utils/format-booking-date";
import { isBookingPast } from "@/lib/utils/is-booking-past";
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
    <li className="card card-border bg-base-100 shadow-sm flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-base-content">{roomName}</p>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-base-content/70">
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
