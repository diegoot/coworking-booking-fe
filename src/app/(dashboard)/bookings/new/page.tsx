import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getRoomById } from "@/lib/data/rooms";
import { getBusinessToday } from "@/lib/utils/business-date";
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
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        New booking
      </h1>
      <div className="mt-4 flex flex-col gap-1">
        <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
          {room.name}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {room.capacity} people &middot; ${room.pricePerHour}/hour
        </p>
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
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Availability for {date}
        </h2>
        <Suspense fallback={<AvailabilityLoading />}>
          <Availability roomId={room.id} date={date} />
        </Suspense>
      </section>
    </main>
  );
}
