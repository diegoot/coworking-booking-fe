import type { BookingStatus } from "@/lib/schemas/booking";

/**
 * The app's first non-zinc semantic color, deliberately scoped to this
 * single badge rather than introduced app-wide: CONFIRMED (green) is the
 * actionable/meaningful state, CANCELLED stays muted zinc since there's
 * nothing left to act on. Shared by `BookingRow` ("My bookings") and
 * `AdminBookingRow` (admin user lookup) so the two views can't drift
 * independently.
 */
const statusBadgeClasses: Record<BookingStatus, string> = {
  CONFIRMED: "badge-success",
  CANCELLED: "badge-ghost",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`badge badge-sm ${statusBadgeClasses[status]}`}>
      {status}
    </span>
  );
}
