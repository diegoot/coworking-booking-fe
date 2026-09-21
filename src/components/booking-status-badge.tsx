import type { BookingStatus } from "@/lib/schemas/booking";

/**
 * The app's first non-zinc semantic color, deliberately scoped to this
 * single badge rather than introduced app-wide: CONFIRMED (green) and
 * PENDING (amber) are actionable/meaningful states, CANCELLED stays
 * muted zinc since there's nothing left to act on. Shared by
 * `BookingRow` ("My bookings") and `AdminBookingRow` (admin user
 * lookup) so the two views can't drift independently.
 */
const statusBadgeClasses: Record<BookingStatus, string> = {
  CONFIRMED:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  CANCELLED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClasses[status]}`}
    >
      {status}
    </span>
  );
}
