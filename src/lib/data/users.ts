import { redirect } from "next/navigation";
import { authFetch } from "@/lib/utils/auth-fetch";
import { getApiUrl } from "@/lib/utils/get-api-url";
import { publicUserListSchema, type PublicUser } from "@/lib/schemas/user";

/**
 * SSR (`no-store`), admin-only: powers the user picker on the admin
 * bookings lookup (`BookingsLookupForm`). Not tagged/cached — this app
 * has no Server Action that mutates the user list (registration is a
 * separate, unrelated flow), so there's nothing to invalidate, and
 * "who exists to look up" should always be current.
 */
export async function getUsers(): Promise<PublicUser[]> {
  const res = await authFetch(`${getApiUrl()}/users`, { cache: "no-store" });

  if (res.status === 401) {
    // Same justification as `getBookingsForUser`: `proxy.ts` only
    // checks the session cookie's presence, not its expiry.
    redirect(`/login?redirect=${encodeURIComponent("/admin")}`);
  }

  if (res.status === 403) {
    // Shouldn't normally happen since `proxy.ts` already gates `/admin`
    // to admins, but the backend is the real authority, so handle this
    // defensively rather than assuming it can't occur.
    throw new Error("You don't have permission to view the user list");
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
  }

  return publicUserListSchema.parse(await res.json());
}
