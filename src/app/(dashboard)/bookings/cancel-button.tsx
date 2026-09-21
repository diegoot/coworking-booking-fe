"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBookingAction } from "@/lib/actions/cancel-booking";

/**
 * Client Component: calls `cancelBookingAction` directly from `onClick`
 * (same direct-call pattern `booking-form.tsx` uses for
 * `createBookingAction`, rather than a `<form action>`). `router.refresh()`
 * is required because `/bookings` is a Server Component page: the Server
 * Action's `updateTag("bookings")` invalidates the tag, but doesn't
 * re-render the already-mounted client tree by itself —
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
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-100"
      >
        {isPending ? "Cancelling..." : "Cancel"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
