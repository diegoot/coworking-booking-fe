import { z } from "zod";

/**
 * Request body for `POST /bookings`. `startTime`/`endTime` travel as
 * ISO datetime strings on the wire (client -> backend), unlike
 * `rooms.ts`'s `pricePerHour`/`capacity`, which need coercion the other
 * way (backend -> client, string -> number). No coercion is needed
 * here: react-hook-form + this schema's resolver produce the ISO
 * string directly from the form inputs.
 */
export const createBookingRequestSchema = z.object({
  roomId: z.string().min(1, "Room is required"),
  startTime: z.iso.datetime({ message: "Invalid start time" }),
  endTime: z.iso.datetime({ message: "Invalid end time" }),
});
export type CreateBookingRequest = z.infer<typeof createBookingRequestSchema>;

/**
 * A single free/busy slot returned by `GET /rooms/:id/availability?date=`.
 * Matches the backend's actual response shape (coworking-booking-api's
 * `RoomAvailability`/`AvailabilitySlot`, confirmed against
 * `rooms.service.ts`): `start`/`end` (not `startTime`/`endTime`) and a
 * `"free" | "busy"` status string, not a boolean.
 */
export const availabilitySlotSchema = z.object({
  start: z.string(),
  end: z.string(),
  status: z.enum(["free", "busy"]),
});
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;

/**
 * Full response shape: `{ roomId, date, slots }`, not a bare array.
 */
export const availabilityResponseSchema = z.object({
  roomId: z.string(),
  date: z.string(),
  slots: z.array(availabilitySlotSchema),
});
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
