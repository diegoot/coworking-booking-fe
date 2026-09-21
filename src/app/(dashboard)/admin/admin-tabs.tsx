"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";

const TABS = [
  { id: "rooms", label: "Rooms" },
  { id: "bookings", label: "Bookings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * Client-side tab switcher for the `@rooms`/`@bookings` parallel slots.
 * Both slots are still real, independent parallel routes (each keeps
 * its own Suspense/error boundary — see `layout.tsx`) — this component
 * only decides which one is visible at a time, it doesn't change how
 * they're rendered. Both are already fetched/rendered server-side on
 * every request regardless of which tab is active (Next.js parallel
 * routes don't lazy-fetch based on client-side visibility), so
 * switching tabs is instant with no extra request.
 *
 * `bookings-lookup-form.tsx` uses `next/form`'s `<Form>` (a string
 * `action`, GET-style), which performs a client-side navigation and
 * explicitly "retains shared UI and client-side state" (Next's own
 * docs) — no full page reload, so this component never remounts and
 * `active` never resets. That means submitting the lookup form doesn't
 * need to tell this component anything: the user is already on the
 * Bookings tab when they submit it (that's where the form lives), and
 * since nothing remounts, it just stays that way.
 *
 * The `useLayoutEffect` below only matters for a genuinely different
 * case: landing on `/admin?userId=...` directly (a fresh link, a
 * bookmark, or a manual reload) — a real full page load, where the
 * server always renders the `"rooms"` default (deterministic, so client
 * and server agree — no hydration mismatch) and this corrects it to
 * `"bookings"` right after hydration. `useSearchParams()` was tried for
 * picking the initial tab directly and caused a real hydration mismatch
 * (documented as client-only for this kind of decision); this
 * effect-based correction avoids that.
 */
export function AdminTabs({
  rooms,
  bookings,
}: {
  rooms: ReactNode;
  bookings: ReactNode;
}) {
  const [active, setActive] = useState<TabId>("rooms");

  useLayoutEffect(() => {
    if (new URLSearchParams(window.location.search).has("userId")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive("bookings");
    }
  }, []);

  const panels: Record<TabId, ReactNode> = { rooms, bookings };

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              active === tab.id
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-50"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-6">
        {panels[active]}
      </div>
    </div>
  );
}
