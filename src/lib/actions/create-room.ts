"use server";

import { updateTag } from "next/cache";
import { authFetch } from "@/lib/utils/auth-fetch";
import { getApiUrl } from "@/lib/utils/get-api-url";
import {
  createRoomRequestSchema,
  type CreateRoomRequest,
} from "@/lib/schemas/room";

export interface CreateRoomActionResult {
  error: string;
}

/**
 * Server Action for `POST /rooms` (admin-only). Mirrors
 * `createBookingAction`'s shape (`lib/actions/create-booking.ts`):
 * validate, call the backend, map error statuses to a user-facing
 * string, and return `{ error }` instead of throwing so the caller can
 * render it inline.
 *
 * On success, calls `updateTag("rooms")` — the same tag
 * `src/lib/data/rooms.ts`'s `getRooms()`/`getRoomById()` already use —
 * so the room list picks up the new room immediately. Unlike
 * `createBookingAction`, this does NOT `redirect`: room creation stays
 * on `/admin`, the calling form component calls `router.refresh()`
 * client-side instead.
 */
export async function createRoomAction(
  values: CreateRoomRequest
): Promise<CreateRoomActionResult | undefined> {
  const parsed = createRoomRequestSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid room data" };
  }

  const backendRes = await authFetch(`${getApiUrl()}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  if (!backendRes.ok) {
    if (backendRes.status === 401) {
      return { error: "You must be logged in to create a room" };
    }
    if (backendRes.status === 403) {
      return { error: "You don't have permission to create rooms" };
    }
    if (backendRes.status === 422) {
      return { error: "Invalid room data" };
    }
    return { error: "Failed to create room" };
  }

  updateTag("rooms");
}
