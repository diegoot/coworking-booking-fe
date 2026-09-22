"use client";

import { useState } from "react";
import Link from "next/link";
import type { Room } from "@/lib/data/rooms";

const buttonClasses =
  "inline-flex w-fit items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";

/**
 * "New booking" picker for "My bookings": always visible (no toggle),
 * a room select (name + capacity + price, so the choice doesn't need a
 * second trip to Home/room detail to compare rooms) and a "Book now"
 * that's disabled until a room is selected. Only once a room is chosen
 * does "Book now" become a real `<Link>` to `/bookings/new?room=[id]`
 * — same disabled-placeholder-vs-real-Link pattern `BookNowButton`
 * uses, gated on the selection instead of session state.
 *
 * Client Component: needs local state for the current selection, which
 * doesn't exist server-side.
 */
export function NewBookingPicker({ rooms }: { rooms: Room[] }) {
  const [selectedRoomId, setSelectedRoomId] = useState("");

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="new-booking-room"
        className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
      >
        New booking
      </label>
      <div className="flex items-center gap-2">
        <select
          id="new-booking-room"
          value={selectedRoomId}
          onChange={(event) => setSelectedRoomId(event.target.value)}
          className="h-10 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-100"
        >
          <option value="" disabled>
            Select a room
          </option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.capacity} people, ${room.pricePerHour}/hour)
            </option>
          ))}
        </select>
        {selectedRoomId ? (
          <Link
            href={`/bookings/new?room=${selectedRoomId}`}
            className={`${buttonClasses} h-10`}
          >
            Book now
          </Link>
        ) : (
          <span
            aria-hidden="true"
            className={`${buttonClasses} h-10 pointer-events-none opacity-50`}
          >
            Book now
          </span>
        )}
      </div>
    </div>
  );
}
