import { getBookingsForUser } from "@/lib/data/bookings";
import { getRooms } from "@/lib/data/rooms";
import { AdminBookingRow } from "./admin-booking-row";

/**
 * Async Server Component: fetches a specific user's bookings via
 * `getBookingsForUser` (`src/lib/data/bookings.ts`, tagged
 * `"admin-bookings"`) and the room list via `getRooms()` (ISR-cached,
 * `src/lib/data/rooms.ts`) concurrently, same `roomId -> name` map
 * pattern as `src/app/(dashboard)/bookings/bookings-list.tsx` — bookings
 * only carry a `roomId`, not a room name, so this avoids an N+1
 * `getRoomById` call per booking.
 */
export async function BookingsLookupResults({ userId }: { userId: string }) {
  const [bookings, rooms] = await Promise.all([
    getBookingsForUser(userId),
    getRooms(),
  ]);

  if (bookings.length === 0) {
    return (
      <p className="text-sm text-base-content/70">
        No bookings for this user.
      </p>
    );
  }

  const roomNameById = new Map(rooms.map((room) => [room.id, room.name]));

  return (
    <ul className="flex flex-col gap-2">
      {bookings.map((booking) => (
        <AdminBookingRow
          key={booking.id}
          booking={booking}
          roomName={roomNameById.get(booking.roomId) ?? "Unknown room"}
        />
      ))}
    </ul>
  );
}
