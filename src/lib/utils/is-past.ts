/**
 * True once an absolute instant (ISO datetime with offset) has already
 * passed. No timezone handling needed: both `isoDateTime` and
 * `Date.now()` are absolute instants, not calendar dates — unlike
 * `business-date.ts`'s `getBusinessToday()`, which resolves a calendar
 * *day* and genuinely needs a timezone to do that.
 */
export function isPast(isoDateTime: string): boolean {
  return new Date(isoDateTime).getTime() < Date.now();
}
