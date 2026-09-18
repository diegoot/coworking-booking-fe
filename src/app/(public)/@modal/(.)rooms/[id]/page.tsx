import { notFound } from "next/navigation";
import { getRoomById } from "@/lib/data/rooms";
import { RoomDetail } from "@/app/(public)/rooms/[id]/room-detail";
import { ModalShell } from "./modal-shell";

// Same ISR strategy as the full page it intercepts.
export const revalidate = 3600;

type InterceptedRoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InterceptedRoomDetailPage({
  params,
}: InterceptedRoomPageProps) {
  const { id } = await params;
  const room = await getRoomById(id);

  if (!room) {
    notFound();
  }

  return (
    <ModalShell>
      <RoomDetail room={room} />
    </ModalShell>
  );
}
