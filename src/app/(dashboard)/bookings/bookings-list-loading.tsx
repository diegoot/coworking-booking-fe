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
          className="flex flex-col gap-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-3.5 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-7 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        </li>
      ))}
    </ul>
  );
}
