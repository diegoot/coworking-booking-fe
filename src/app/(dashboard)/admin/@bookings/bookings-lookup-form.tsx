import Form from "next/form";
import { getUsers } from "@/lib/data/users";
import { getCurrentUser } from "@/lib/utils/get-current-user";

/**
 * `next/form`'s `<Form>` with a string `action`: submits as a GET (form
 * data becomes `?userId=...`) but performs a client-side navigation
 * instead of a full page reload — the framework's own built-in
 * solution for exactly this ("This retains shared UI and client-side
 * state" — Next's own docs). No `"use client"`, no hand-rolled
 * `preventDefault`/`router.push`, and no need to tell `AdminTabs` to
 * switch tabs: since nothing remounts, whichever tab was already
 * active (Bookings, since that's where this form lives) just stays
 * active. Also gets prefetching of `/admin` for free.
 *
 * Async Server Component: fetches the user list (`getUsers`) to
 * populate the picker instead of asking the admin to type/paste a raw
 * user ID. `page.tsx` wraps this in its own Suspense boundary, separate
 * from `BookingsLookupResults`'s, so this fetch doesn't delay the rest
 * of the page shell.
 *
 * Excludes the logged-in admin's own id from the picker — looking up
 * your own bookings belongs on "My bookings" (`/bookings`), not here.
 */
export async function BookingsLookupForm({
  defaultUserId,
}: {
  defaultUserId?: string;
}) {
  const [users, currentUser] = await Promise.all([
    getUsers(),
    getCurrentUser(),
  ]);
  const lookupableUsers = users.filter((user) => user.id !== currentUser?.id);

  return (
    <Form action="/admin" className="flex items-end gap-2">
      <div className="flex flex-1 flex-col">
        <label htmlFor="userId" className="label font-medium">
          User
        </label>
        <select
          id="userId"
          name="userId"
          defaultValue={defaultUserId ?? ""}
          className="select w-full"
        >
          <option value="" disabled>
            Select a user
          </option>
          {lookupableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary">
        Look up
      </button>
    </Form>
  );
}
