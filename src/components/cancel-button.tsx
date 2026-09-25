"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBookingAction } from "@/lib/actions/cancel-booking";

/**
 * Shared between `(dashboard)/bookings` ("my bookings") and
 * `(dashboard)/admin/@bookings` (admin lookup) — same reasoning as
 * `BookingStatusBadge`/`formatBookingDate`: two features render a
 * booking row and both need cancel, so it lives in `components/` rather
 * than being duplicated or reached into from a sibling feature folder.
 *
 * Client Component: calls `cancelBookingAction` directly from `onClick`
 * (same direct-call pattern `booking-form.tsx` uses for
 * `createBookingAction`, rather than a `<form action>`). `router.refresh()`
 * is required because both call sites are Server Component pages: the
 * Server Action's `updateTag(...)` calls invalidate the relevant tag, but
 * don't re-render the already-mounted client tree by themselves —
 * `router.refresh()` re-runs the Server Component tree for the current
 * route so the now-invalidated tag is refetched.
 *
 * Refreshes on failure too, not just success: a 404/409 means the
 * booking is already gone/cancelled (e.g. a second tab cancelled it
 * first), so the row is stale and should resync to show the real
 * current state instead of leaving a now-inaccurate Cancel button
 * behind, in addition to surfacing the error message inline.
 */
export function CancelButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsPending(true);
    setError(null);
    const result = await cancelBookingAction(bookingId);
    setIsPending(false);
    if (result?.error) {
      setError(result.error);
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="btn btn-outline btn-xs"
      >
        {isPending ? "Cancelling..." : "Cancel"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
