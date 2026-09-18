import { getRoomAvailability } from "@/lib/data/bookings";
import { formatSlotTime } from "@/lib/utils/format-slot-time";
import { BookingForm } from "./booking-form";

/**
 * Async Server Component isolating the `no-store` availability fetch
 * behind a Suspense boundary (see `page.tsx`). Also renders
 * `BookingForm` once slots resolve — the form needs the slot list to
 * offer, so it's composed here rather than in `page.tsx`, letting both
 * the availability display and the form appear together once the
 * Suspense boundary resolves (see `page.tsx`'s comment for the
 * structural note).
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
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Availability is not available for this room.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-1.5">
        {availability.slots.map((slot) => (
          <li
            key={`${slot.start}-${slot.end}`}
            className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-800"
          >
            <span className="text-zinc-900 dark:text-zinc-50">
              {formatSlotTime(slot.start)} &ndash; {formatSlotTime(slot.end)}
            </span>
            <span
              className={
                slot.status === "free"
                  ? "text-sm font-medium text-green-700 dark:text-green-400"
                  : "text-sm font-medium text-zinc-500 dark:text-zinc-500"
              }
            >
              {slot.status === "free" ? "Available" : "Busy"}
            </span>
          </li>
        ))}
      </ul>

      <BookingForm roomId={roomId} slots={availability.slots} />
    </div>
  );
}
