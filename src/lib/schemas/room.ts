import { z } from "zod";

/**
 * Request body for `POST /rooms` (admin-only). Unlike `roomSchema` in
 * `src/lib/data/rooms.ts` (a read/response schema that coerces
 * BACKEND RESPONSE strings to numbers, since the wire format sends
 * `pricePerHour` as a string), this is a write/request schema: the
 * `z.coerce.number()` calls here coerce FORM INPUT STRINGS coming from
 * `<input type="number">` via react-hook-form into real numbers before
 * they're sent to the backend. Same Zod primitive, different direction,
 * don't conflate the two.
 */
export const createRoomRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  capacity: z.coerce
    .number()
    .int()
    .positive("Capacity must be a positive integer"),
  pricePerHour: z.coerce.number().positive("Price must be positive"),
});
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;
