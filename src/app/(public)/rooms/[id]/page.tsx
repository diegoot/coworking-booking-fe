import { notFound } from "next/navigation";
import { getRoomById } from "@/lib/api/rooms";
import { RoomDetail } from "./room-detail";

// ISR: room name/capacity/price rarely change (see AGENTS.md rendering
// strategy table).
export const revalidate = 3600;

type RoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoomDetailPage({ params }: RoomPageProps) {
  const { id } = await params;
  const room = await getRoomById(id);

  if (!room) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <RoomDetail room={room} />
    </main>
  );
}
