/**
 * Suspense fallback for `BookingsLookupResults`. Mirrors the shape
 * `AdminBookingRow` renders once resolved (room name + status badge,
 * date/time line) so the layout doesn't jump when the real content
 * streams in — same vocabulary as
 * `src/app/(dashboard)/bookings/bookings-list-loading.tsx`.
 */
export default function BookingsLookupResultsLoading() {
  return (
    <ul className="flex flex-col gap-2" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-3.5 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </li>
      ))}
    </ul>
  );
}
