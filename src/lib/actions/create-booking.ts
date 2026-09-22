"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { authFetch } from "@/lib/utils/auth-fetch";
import { getApiUrl } from "@/lib/utils/get-api-url";
import {
  createBookingRequestSchema,
  type CreateBookingRequest,
} from "@/lib/schemas/booking";

export interface CreateBookingActionResult {
  error: string;
}

/**
 * Server Action for `POST /bookings`. Mirrors `registerAction`'s shape
 * (`lib/actions/register.ts`): validate, call the backend, map error
 * statuses to a user-facing string, and return `{ error }` instead of
 * throwing so the caller can render it inline.
 *
 * On success, calls `updateTag("bookings")` — read-your-own-writes
 * invalidation (Server-Action-only, immediate) so `/bookings` (the "My
 * bookings" list, `lib/data/bookings.ts#getMyBookings`, tagged
 * `["bookings"]`) sees this booking right away instead of stale cached
 * data. Then redirects to `/bookings`.
 */
export async function createBookingAction(
  values: CreateBookingRequest
): Promise<CreateBookingActionResult | undefined> {
  const parsed = createBookingRequestSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid booking data" };
  }

  const backendRes = await authFetch(`${getApiUrl()}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  if (!backendRes.ok) {
    if (backendRes.status === 401) {
      return { error: "You must be logged in to book a room" };
    }
    if (backendRes.status === 403) {
      return { error: "Admin accounts can't book rooms" };
    }
    if (backendRes.status === 409) {
      return { error: "This slot is no longer available" };
    }
    return { error: "Failed to create booking" };
  }

  updateTag("bookings");
  redirect("/bookings");
}
