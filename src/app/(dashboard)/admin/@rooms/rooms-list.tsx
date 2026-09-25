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
    return <p className="text-sm text-base-content/70">No rooms yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {rooms.map((room) => (
        <li key={room.id} className="card card-border bg-base-100 shadow-sm p-3 text-sm">
          <p className="font-medium text-base-content">{room.name}</p>
          <p className="text-base-content/70">
            {room.capacity} people &middot; ${room.pricePerHour}/hour
          </p>
        </li>
      ))}
    </ul>
  );
}
