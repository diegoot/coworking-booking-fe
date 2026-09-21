"use server";

import { updateTag } from "next/cache";
import { authFetch } from "@/lib/utils/auth-fetch";
import { getApiUrl } from "@/lib/utils/get-api-url";

export interface CancelBookingActionResult {
  error: string;
}

/**
 * Server Action for `DELETE /bookings/:id`. Mirrors `createBookingAction`'s
 * shape (`lib/actions/create-booking.ts`): call the backend, map error
 * statuses to a user-facing string, return `{ error }` instead of
 * throwing. Unlike `createBookingAction`, there's no redirect on
 * success — this is an in-place list update (see `CancelButton`, which
 * calls `router.refresh()` after a successful call), not a navigation.
 *
 * The backend's cancel is intentionally not idempotent: cancelling an
 * already-cancelled booking is a 409, surfaced here as-is rather than
 * worked around client-side.
 */
export async function cancelBookingAction(
  bookingId: string
): Promise<CancelBookingActionResult | undefined> {
  const res = await authFetch(`${getApiUrl()}/bookings/${bookingId}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      return { error: "You must be logged in to cancel a booking" };
    }
    if (res.status === 403) {
      return { error: "You don't have permission to cancel this booking" };
    }
    if (res.status === 404) {
      return { error: "This booking no longer exists" };
    }
    if (res.status === 409) {
      return { error: "This booking is already cancelled" };
    }
    return { error: "Failed to cancel booking" };
  }

  updateTag("bookings");
}
