import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getRoomById } from "@/lib/data/rooms";
import { getBusinessToday } from "@/lib/utils/business-date";
import { RoomAmenities } from "@/components/room-amenities";
import { Availability } from "./availability";
import AvailabilityLoading from "./availability-loading";

type NewBookingPageProps = {
  searchParams: Promise<{ room?: string }>;
};

// SSR, no `revalidate` export: protected route, and availability must
// always be fresh (`no-store`) per AGENTS.md's rendering strategy
// table. Only the availability fetch itself is isolated behind
// Suspense below, so the room summary and form shell render
// immediately without waiting on it.
export default async function NewBookingPage({
  searchParams,
}: NewBookingPageProps) {
  const { room: roomId } = await searchParams;

  if (!roomId) {
    notFound();
  }

  const room = await getRoomById(roomId);

  if (!room) {
    notFound();
  }

  const date = getBusinessToday();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-base-content">
        Book <span className="text-base-content/60">{room.name}</span>
      </h1>

      <div className="card card-border bg-base-100 shadow-sm mt-4">
        <div className="card-body gap-3">
          <div className="flex gap-2">
            <span className="badge badge-ghost">{room.capacity} people</span>
            <span className="badge badge-accent badge-outline">
              ${room.pricePerHour}/hr
            </span>
          </div>
          <RoomAmenities />
        </div>
      </div>

      {/*
        `BookingForm` is rendered inside `Availability` (see that file)
        instead of here: the form needs the resolved slot list to offer
        as options, so it waits behind the same Suspense boundary as the
        availability display rather than rendering an empty shell above
        it. This keeps the "form shell renders immediately" behavior
        for the room summary above, while the slot-dependent parts
        (list + form) stream in together.
      */}
      <section className="mt-6 flex flex-col gap-2">
        <Suspense fallback={<AvailabilityLoading />}>
          <Availability roomId={room.id} date={date} />
        </Suspense>
      </section>
    </main>
  );
}
