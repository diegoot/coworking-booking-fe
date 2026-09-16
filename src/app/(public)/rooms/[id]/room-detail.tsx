import Link from "next/link";
import type { Room } from "@/lib/api/rooms";

/**
 * Presentational room detail, shared between the full page
 * (`(public)/rooms/[id]/page.tsx`) and the intercepted modal
 * (`(public)/@modal/(.)rooms/[id]/page.tsx`) so both render identical
 * content.
 */
export function RoomDetail({ room }: { room: Room }) {
  const bookNowHref = `/bookings/new?room=${room.id}`;
  // TODO: there's no session/auth state yet (Zustand store lands with the
  // auth feature). Until then, always send the user through the
  // "not authenticated" branch of the "Book now" flow described in
  // AGENTS.md. Once auth exists, check the session here (or in a client
  // wrapper) and link straight to `bookNowHref` when logged in.
  const loginRedirectHref = `/login?redirect=${encodeURIComponent(bookNowHref)}`;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {room.name}
      </h1>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Capacity</dt>
          <dd className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            {room.capacity} people
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Price</dt>
          <dd className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            ${room.pricePerHour}/hour
          </dd>
        </div>
      </dl>
      <Link
        href={loginRedirectHref}
        className="inline-flex w-fit items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Book now
      </Link>
    </div>
  );
}
