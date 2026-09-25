/**
 * Suspense fallback for `Availability` (see `page.tsx`). Mirrors the
 * shape `Availability` renders once resolved — a slot list followed by
 * the booking form — so the layout doesn't jump when the real content
 * streams in.
 */
export default function AvailabilityLoading() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      <div className="skeleton h-4 w-48" />

      <div className="card card-border bg-base-100 shadow-sm mb-2 flex flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="skeleton h-10 w-32 rounded-md" />
    </div>
  );
}
