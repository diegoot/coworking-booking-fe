import { getRoomAvailability } from "@/lib/data/bookings";
import { BookingForm } from "./booking-form";

/**
 * Async Server Component isolating the `no-store` availability fetch
 * behind a Suspense boundary (see `page.tsx`). Renders `BookingForm`
 * once slots resolve — the form needs the slot list to offer, so it's
 * composed here rather than in `page.tsx`. `BookingForm` itself is the
 * single source of truth for displaying slots (free and busy together,
 * see its own comment) — this component only fetches and hands off,
 * it doesn't render a second, separate read-only slot list.
 */
export async function Availability({
  roomId,
  date,
}: {
  roomId: string;
  date: string;
}) {
  const availability = await getRoomAvailability(roomId, date);

  if (!availability) {
    return (
      <p className="text-sm text-base-content/70">
        Availability is not available for this room.
      </p>
    );
  }

  return <BookingForm roomId={roomId} date={date} slots={availability.slots} />;
}
