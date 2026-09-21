import { redirect } from "next/navigation";
import { authFetch } from "@/lib/utils/auth-fetch";
import { getApiUrl } from "@/lib/utils/get-api-url";
import {
  availabilityResponseSchema,
  bookingListSchema,
  type AvailabilityResponse,
  type Booking,
} from "@/lib/schemas/booking";

/**
 * SSR, always fresh (`no-store`) per AGENTS.md's rendering strategy
 * table: availability is business-sensitive and changes constantly.
 * Requires auth, so this goes through `authFetch` rather than plain
 * `fetch`.
 */
export async function getRoomAvailability(
  roomId: string,
  date: string
): Promise<AvailabilityResponse | null> {
  const res = await authFetch(
    `${getApiUrl()}/rooms/${roomId}/availability?date=${date}`,
    { cache: "no-store" }
  );

  if (res.status === 404) {
    return null;
  }

  if (res.status === 401) {
    // `proxy.ts` only checks the session cookie's presence, not its
    // expiry — a request with a stale-but-present cookie reaches here
    // and gets a real 401 from the backend. Send the user back through
    // the same `?redirect=` flow `proxy.ts` uses for a missing cookie,
    // rather than letting this surface as a generic thrown error.
    redirect(
      `/login?redirect=${encodeURIComponent(`/bookings/new?room=${roomId}`)}`
    );
  }

  if (!res.ok) {
    throw new Error(
      `Failed to fetch availability for room ${roomId}: ${res.status} ${res.statusText}`
    );
  }

  return availabilityResponseSchema.parse(await res.json());
}

/**
 * SSR per AGENTS.md's rendering strategy table ("`/bookings` | SSR |
 * User-specific, must be fresh"), but satisfied via tag invalidation
 * rather than literal `no-store`: this fetch is tagged `"bookings"`
 * (not `cache: "no-store"`, which would silently drop `next.tags` since
 * the two options conflict) so `createBookingAction` and
 * `cancelBookingAction`'s existing/new `updateTag("bookings")` calls
 * have something to invalidate — read-your-own-writes freshness instead
 * of no-store freshness.
 */
export async function getMyBookings(): Promise<Booking[]> {
  const res = await authFetch(`${getApiUrl()}/bookings/me`, {
    next: { tags: ["bookings"] },
  });

  if (res.status === 401) {
    // Same justification as `getRoomAvailability` above: `proxy.ts`
    // only checks the session cookie's presence, not its expiry.
    redirect(`/login?redirect=${encodeURIComponent("/bookings")}`);
  }

  if (!res.ok) {
    throw new Error(
      `Failed to fetch bookings: ${res.status} ${res.statusText}`
    );
  }

  return bookingListSchema.parse(await res.json());
}

/**
 * SSR (`no-store`) per AGENTS.md's rendering strategy table ("`/admin`
 * (both slots) | SSR (`no-store`) | Admin data must be fresh"), admin
 * lookup of an arbitrary user's bookings via `GET /bookings/:userId`.
 * Tagged `"admin-bookings"` — deliberately different from
 * `getMyBookings()`'s `"bookings"` tag, since this is a different
 * audience (an admin looking up someone else's bookings) and nothing
 * should cross-invalidate between "my own bookings" and "admin lookup
 * of an arbitrary user".
 *
 * No special 404 handling: the backend's `listBookingsForUser` does a
 * plain `findMany({ where: { userId } })` with no existence check on
 * the user, so a nonexistent/no-bookings userId returns `200` with
 * `[]`, never a 404.
 */
export async function getBookingsForUser(userId: string): Promise<Booking[]> {
  const res = await authFetch(`${getApiUrl()}/bookings/${userId}`, {
    next: { tags: ["admin-bookings"] },
  });

  if (res.status === 401) {
    // Same justification as `getMyBookings` above: `proxy.ts` only
    // checks the session cookie's presence, not its expiry.
    redirect(`/login?redirect=${encodeURIComponent("/admin")}`);
  }

  if (res.status === 403) {
    // Shouldn't normally happen since `proxy.ts` already gates `/admin`
    // to admins, but the backend is the real authority, so handle this
    // defensively rather than assuming it can't occur.
    throw new Error("You don't have permission to view this user's bookings");
  }

  if (!res.ok) {
    throw new Error(
      `Failed to fetch bookings for user ${userId}: ${res.status} ${res.statusText}`
    );
  }

  return bookingListSchema.parse(await res.json());
}
