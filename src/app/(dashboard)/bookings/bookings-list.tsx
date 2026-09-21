import { getMyBookings } from "@/lib/data/bookings";
import { getRooms } from "@/lib/data/rooms";
import { BookingRow } from "./booking-row";

/**
 * Async Server Component isolating the "must be fresh" bookings fetch
 * behind Suspense (see `page.tsx`). Runs `getMyBookings()` and
 * `getRooms()` concurrently since neither depends on the other —
 * `getRooms()` is ISR-cached (`lib/data/rooms.ts`), so this doesn't cost
 * an extra round trip to the backend in practice. Bookings only carry a
 * `roomId`, not a room name, so a `roomId -> name` map is built here to
 * avoid an N+1 `getRoomById` call per booking.
 */
export async function BookingsList() {
  const [bookings, rooms] = await Promise.all([getMyBookings(), getRooms()]);

  if (bookings.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        You don&apos;t have any bookings yet.
      </p>
    );
  }

  const roomNameById = new Map(rooms.map((room) => [room.id, room.name]));

  return (
    <ul className="flex flex-col gap-3">
      {bookings.map((booking) => (
        <BookingRow
          key={booking.id}
          booking={booking}
          roomName={roomNameById.get(booking.roomId) ?? "Unknown room"}
        />
      ))}
    </ul>
  );
}
