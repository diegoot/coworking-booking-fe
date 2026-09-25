import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getRoomById, getRooms } from "@/lib/data/rooms";
import { RoomDetail } from "./room-detail";

// ISR: room name/capacity/price rarely change (see AGENTS.md rendering
// strategy table).
export const revalidate = 3600;

type RoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoomDetailPage({ params }: RoomPageProps) {
  const { id } = await params;
  const [room, rooms] = await Promise.all([getRoomById(id), getRooms()]);

  if (!room) {
    notFound();
  }

  const otherRooms = rooms.filter((r) => r.id !== room.id).slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1 text-sm text-base-content/60">
          <li>
            <Link href="/" className="link link-hover">
              Home
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-base-content">{room.name}</span>
          </li>
        </ol>
      </nav>

      <RoomDetail room={room} />

      {otherRooms.length > 0 && (
        <div className="mt-10 border-t border-base-300 pt-6">
          <h2 className="mb-3 text-sm font-semibold text-base-content">
            Other rooms
          </h2>
          <ul className="flex flex-col gap-2">
            {otherRooms.map((otherRoom) => (
              <li key={otherRoom.id}>
                <Link
                  href={`/rooms/${otherRoom.id}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-base-200"
                >
                  <span className="font-medium text-base-content">
                    {otherRoom.name}
                  </span>
                  <span className="text-base-content/60">
                    {otherRoom.capacity} people &middot; $
                    {otherRoom.pricePerHour}/hr
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
