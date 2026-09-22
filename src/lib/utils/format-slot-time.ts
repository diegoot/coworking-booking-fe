import { BUSINESS_TIMEZONE } from "@/lib/utils/business-date";

/**
 * Formats an availability slot's ISO timestamp for display. Fixed to
 * `BUSINESS_TIMEZONE` ("America/Argentina/Buenos_Aires") deliberately,
 * for two reasons: (1) `Availability` (a Server Component) and
 * `BookingForm` (a Client Component) both render the same slot list,
 * and without a fixed zone they'd resolve to the server's and the
 * browser's local time respectively — showing different hours for the
 * same slot whenever those differ; (2) business hours (8-20) are
 * themselves anchored to Argentina wall-clock time (see the backend's
 * `businessHours.ts`), so that's the only zone in which a slot's
 * displayed hour actually matches the real-world time someone in the
 * room would experience — a fixed-but-arbitrary zone (this used to be
 * UTC) would satisfy reason (1) while still showing the wrong hour.
 */
export function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BUSINESS_TIMEZONE,
  });
}
