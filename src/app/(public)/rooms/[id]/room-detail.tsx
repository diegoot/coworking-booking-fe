import type { Room } from "@/lib/data/rooms";
import { BookNowButton } from "./book-now-button";

/**
 * Presentational room detail, shared between the full page
 * (`(public)/rooms/[id]/page.tsx`) and the intercepted modal
 * (`(public)/@modal/(.)rooms/[id]/page.tsx`) so both render identical
 * content. Stays a Server Component: only the "Book now" button, which
 * needs session state, is a client subcomponent.
 */
export function RoomDetail({ room }: { room: Room }) {
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
      <BookNowButton roomId={room.id} />
    </div>
  );
}
