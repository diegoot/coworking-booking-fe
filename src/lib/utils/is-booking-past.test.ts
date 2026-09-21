import { describe, expect, it } from "vitest";
import { isBookingPast } from "./is-booking-past";
import type { Booking } from "@/lib/schemas/booking";

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "b1",
    userId: "u1",
    roomId: "room-1",
    startTime: "2026-09-18T09:00:00.000Z",
    endTime: "2026-09-18T10:00:00.000Z",
    status: "CONFIRMED",
    createdAt: "2026-09-17T09:00:00.000Z",
    ...overrides,
  };
}

describe("isBookingPast", () => {
  it("returns true when the booking's endTime has already passed", () => {
    expect(
      isBookingPast(makeBooking({ endTime: "2026-09-18T10:00:00.000Z" }))
    ).toBe(true);
  });

  it("returns false when the booking's endTime is still in the future", () => {
    const end = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    expect(isBookingPast(makeBooking({ endTime: end }))).toBe(false);
  });
});
