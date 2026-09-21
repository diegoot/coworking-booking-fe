/**
 * Formats a booking's date, fixed to `timeZone: "UTC"` for the same
 * server/client render-parity reason `formatSlotTime` documents — a
 * booking's date, unlike an availability slot's, isn't always "today",
 * so it needs its own date portion alongside `formatSlotTime`'s time
 * portion. Shared by `BookingRow` ("My bookings") and `AdminBookingRow`
 * (admin user lookup) so the two views can't drift independently.
 */
export function formatBookingDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
