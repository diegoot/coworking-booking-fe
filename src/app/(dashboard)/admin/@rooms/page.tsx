import { Suspense } from "react";
import { CreateRoomForm } from "./create-room-form";
import { RoomsList } from "./rooms-list";
import RoomsListLoading from "./rooms-list-loading";

// SSR (`no-store` via `updateTag`-driven revalidation): admin data must
// be fresh per AGENTS.md's rendering strategy table. `RoomsList` is
// isolated behind its own Suspense boundary so the create-room form
// shell renders immediately.
export default function AdminRoomsSlot() {
  return (
    <div className="flex flex-col gap-6">
      <CreateRoomForm />
      <Suspense fallback={<RoomsListLoading />}>
        <RoomsList />
      </Suspense>
    </div>
  );
}
