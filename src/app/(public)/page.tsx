import Link from "next/link";
import { getRooms } from "@/lib/data/rooms";

// ISR: room list changes rarely (see AGENTS.md rendering strategy table).
export const revalidate = 3600;

export default async function HomePage() {
  const rooms = await getRooms();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Book the right room, right when you need it.
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Independent professionals, teams, and companies of any size — find
          your ideal coworking room with real-time availability, transparent
          hourly pricing, and instant booking. No long-term commitments, no
          wasted space.
        </p>
      </div>

      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Our rooms
      </h2>

      {rooms.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No rooms available right now.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rooms.map((room) => (
            <li
              key={room.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {room.name}
              </span>
              <Link
                href={`/rooms/${room.id}`}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                View details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
