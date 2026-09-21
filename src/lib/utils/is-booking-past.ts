import type { Booking } from "@/lib/schemas/booking";

/**
 * True once a booking's slot has fully ended. UI-only: the backend's
 * `cancelBooking` (coworking-booking-api's `bookings.service.ts`)
 * doesn't reject cancelling a past booking, it only checks
 * ownership/admin and that it isn't already `CANCELLED` — this just
 * hides the `CancelButton` for a booking there's no real reason to
 * cancel anymore.
 */
export function isBookingPast(booking: Booking): boolean {
  return new Date(booking.endTime).getTime() < Date.now();
}
