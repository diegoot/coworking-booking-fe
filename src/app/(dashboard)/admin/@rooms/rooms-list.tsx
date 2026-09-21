import { getRooms } from "@/lib/data/rooms";

/**
 * Async Server Component: fetches the room list via `getRooms()`
 * (`src/lib/data/rooms.ts`, tagged `"rooms"`) so `createRoomAction`'s
 * `updateTag("rooms")` invalidates this immediately after a new room is
 * created.
 */
export async function RoomsList() {
  const rooms = await getRooms();

  if (rooms.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No rooms yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {rooms.map((room) => (
        <li
          key={room.id}
          className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800"
        >
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            {room.name}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            {room.capacity} people &middot; ${room.pricePerHour}/hour
          </p>
        </li>
      ))}
    </ul>
  );
}
