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
        <li key={i} className="card card-border bg-base-100 shadow-sm flex-col gap-2 p-3">
          <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-4 w-16 rounded-full" />
          </div>
          <div className="skeleton h-3.5 w-40" />
        </li>
      ))}
    </ul>
  );
}
