import Link from "next/link";
import { Building2, Clock, DollarSign, Zap } from "lucide-react";
import { getRooms } from "@/lib/data/rooms";

// ISR: room list changes rarely (see AGENTS.md rendering strategy table).
export const revalidate = 3600;

const roomTints = [
  "bg-primary/10 text-primary",
  "bg-accent/10 text-accent",
  "bg-secondary/10 text-secondary",
];

const heroFeatures = [
  { title: "Real-time availability", Icon: Clock },
  { title: "Transparent hourly pricing", Icon: DollarSign },
  { title: "Instant booking", Icon: Zap },
];

export default async function HomePage() {
  const rooms = await getRooms();

  return (
    <main className="flex w-full flex-1 flex-col">
      <div>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-balance text-base-content">
            Book the right room, right when you need it.
          </h1>
          <p className="max-w-xl text-base-content/70">
            Independent professionals, teams, and companies of any size — find
            your ideal coworking room with real-time availability, transparent
            hourly pricing, and instant booking. No long-term commitments, no
            wasted space.
          </p>

          <ul className="mt-4 flex flex-wrap gap-6">
            {heroFeatures.map(({ title, Icon }) => (
              <li
                key={title}
                className="flex items-center gap-2 text-sm font-medium text-base-content"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 border-t border-base-300 px-6 py-12">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-base-content">
            Our rooms
          </h2>
          <p className="text-base-content/70">
            Pick a room and book instantly.
          </p>
        </div>

        {rooms.length === 0 ? (
          <p className="text-base-content/70">No rooms available right now.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {rooms.map((room, index) => {
              const imageBlock = (
                <div className="order-1 flex w-full items-center justify-center sm:order-none sm:w-1/2 sm:px-6">
                  <div
                    className={`flex h-40 w-full items-center justify-center rounded-box ${roomTints[index % roomTints.length]}`}
                  >
                    <Building2
                      className="h-12 w-12"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              );

              const isDetailsOnRight = index % 2 === 0;
              const detailsBlock = (
                <div
                  className={`order-2 flex w-full flex-col items-start justify-center gap-2 sm:order-none sm:w-1/2 sm:px-6 ${
                    isDetailsOnRight ? "sm:items-end sm:text-right" : ""
                  }`}
                >
                  <h3 className="text-xl font-semibold text-base-content">
                    {room.name}
                  </h3>
                  <div className="flex gap-2">
                    <span className="badge badge-ghost">
                      {room.capacity} people
                    </span>
                    <span className="badge badge-accent badge-outline">
                      ${room.pricePerHour}/hr
                    </span>
                  </div>
                  <Link
                    href={`/rooms/${room.id}`}
                    className="btn btn-outline btn-primary btn-sm mt-2"
                  >
                    View details
                  </Link>
                </div>
              );

              return (
                <li
                  key={room.id}
                  className="card card-border bg-base-100/50 relative flex-col items-stretch gap-6 p-6 sm:flex-row sm:gap-0"
                >
                  <div className="absolute inset-y-6 left-1/2 hidden w-px -translate-x-1/2 bg-base-300 sm:block" />
                  {index % 2 === 1 ? (
                    <>
                      {detailsBlock}
                      {imageBlock}
                    </>
                  ) : (
                    <>
                      {imageBlock}
                      {detailsBlock}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
