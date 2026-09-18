/**
 * Formats an availability slot's ISO timestamp for display. Fixed to
 * `timeZone: "UTC"` deliberately: `Availability` (a Server Component)
 * and `BookingForm` (a Client Component) both render the same slot list,
 * and without a fixed zone they'd resolve to the server's and the
 * browser's local time respectively — showing different hours for the
 * same slot whenever those differ.
 */
export function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
