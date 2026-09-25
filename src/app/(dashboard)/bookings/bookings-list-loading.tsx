/**
 * Suspense fallback for `BookingsList`. Mirrors the shape `BookingRow`
 * renders once resolved (room name + badge, date/time line, cancel
 * button) so the layout doesn't jump when the real content streams in.
 */
export default function BookingsListLoading() {
  return (
    <ul className="flex flex-col gap-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="card card-border bg-base-100 shadow-sm flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-4 w-16 rounded-full" />
            </div>
            <div className="skeleton h-3.5 w-48" />
          </div>
          <div className="skeleton h-7 w-16 rounded-md" />
        </li>
      ))}
    </ul>
  );
}
