import { BUSINESS_TIMEZONE } from "@/lib/utils/business-date";

/**
 * Formats a booking's date, fixed to `BUSINESS_TIMEZONE` for the same
 * two reasons `formatSlotTime` documents (server/client render-parity,
 * and matching the Argentina wall-clock the business actually runs on)
 * — a booking's date, unlike an availability slot's, isn't always
 * "today", so it needs its own date portion alongside `formatSlotTime`'s
 * time portion. Shared by `BookingRow` ("My bookings") and
 * `AdminBookingRow` (admin user lookup) so the two views can't drift
 * independently.
 */
export function formatBookingDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    timeZone: BUSINESS_TIMEZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
