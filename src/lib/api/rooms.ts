import { z } from "zod";

const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.coerce.number(), // already numeric on the wire; coerce is just defensive
  pricePerHour: z.coerce.number(), // backend serializes this as a string (e.g. "10")
});

const roomListSchema = z.array(roomSchema);

export type Room = z.infer<typeof roomSchema>;

function getApiUrl(): string {
  const url = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "Missing API_URL/NEXT_PUBLIC_API_URL environment variable"
    );
  }
  return url;
}

/**
 * ISR: revalidated every hour (see AGENTS.md rendering strategy table).
 * Tagged so a future `POST /rooms` Server Action can call
 * `revalidateTag("rooms")` and immediately reflect newly created rooms.
 */
export async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${getApiUrl()}/rooms`, {
    next: { revalidate: 3600, tags: ["rooms"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch rooms: ${res.status} ${res.statusText}`);
  }

  return roomListSchema.parse(await res.json());
}

export async function getRoomById(id: string): Promise<Room | null> {
  const res = await fetch(`${getApiUrl()}/rooms/${id}`, {
    next: { revalidate: 3600, tags: ["rooms"] },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(
      `Failed to fetch room ${id}: ${res.status} ${res.statusText}`
    );
  }

  return roomSchema.parse(await res.json());
}
