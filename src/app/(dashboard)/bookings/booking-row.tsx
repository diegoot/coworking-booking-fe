import type { Booking, BookingStatus } from "@/lib/schemas/booking";
import { formatSlotTime } from "@/lib/utils/format-slot-time";
import { CancelButton } from "./cancel-button";

/**
 * Status -> badge classes. This is the app's first non-zinc semantic
 * color, deliberately scoped to this single badge rather than
 * introduced app-wide: CONFIRMED (green) and PENDING (amber) are
 * actionable/meaningful states, CANCELLED stays muted zinc since
 * there's nothing left to act on.
 */
const statusBadgeClasses: Record<BookingStatus, string> = {
  CONFIRMED:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  CANCELLED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

/**
 * Formats a booking's date, fixed to `timeZone: "UTC"` for the same
 * server/client render-parity reason `formatSlotTime` documents — a
 * booking's date, unlike an availability slot's, isn't always "today",
 * so it needs its own date portion alongside the reused time portion.
 */
function formatBookingDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClasses[booking.status]}`}
          >
            {booking.status}
          </span>
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
