import Form from "next/form";

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
 */
export function BookingsLookupForm({
  defaultUserId,
}: {
  defaultUserId?: string;
}) {
  return (
    <Form action="/admin" className="flex items-end gap-2">
      <div className="flex flex-1 flex-col">
        <label
          htmlFor="userId"
          className="mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          User ID
        </label>
        <input
          id="userId"
          type="text"
          name="userId"
          defaultValue={defaultUserId}
          autoComplete="off"
          data-1p-ignore="true"
          data-lpignore="true"
          data-bwignore="true"
          className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-100"
        />
      </div>
      <button
        type="submit"
        className="h-10 appearance-none rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Look up
      </button>
    </Form>
  );
}
