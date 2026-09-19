/**
 * The coworking space's own timezone (matches `BUSINESS_TIMEZONE` in
 * the backend, `coworking-booking-api/src/shared/config/businessHours.ts`)
 * — "today" for booking purposes is the business's calendar day, not
 * the visitor's or the server's local day.
 */
export const BUSINESS_TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * Today's date as `YYYY-MM-DD` in the business's timezone. Deliberately
 * NOT `new Date().toISOString().slice(0, 10)` — that gives the UTC
 * calendar day, which is already "tomorrow" for anyone in Argentina
 * (UTC-3) after 21:00 local time.
 */
export function getBusinessToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
