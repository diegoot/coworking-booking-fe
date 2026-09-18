/**
 * Suspense fallback for `Availability` (see `page.tsx`). Mirrors the
 * shape `Availability` renders once resolved — a slot list followed by
 * the booking form — so the layout doesn't jump when the real content
 * streams in.
 */
export default function AvailabilityLoading() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <ul className="flex flex-col gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <li
            key={i}
            className="h-9 w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
