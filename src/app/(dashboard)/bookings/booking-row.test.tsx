import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingRow } from "./booking-row";
import type { Booking } from "@/lib/schemas/booking";

vi.mock("@/components/cancel-button", () => ({
  CancelButton: ({ bookingId }: { bookingId: string }) => (
    <button type="button">Cancel {bookingId}</button>
  ),
}));

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

describe("BookingRow", () => {
  it("renders room name, formatted date/time, and the status badge text", () => {
    render(
      <BookingRow booking={makeBooking({ status: "CONFIRMED" })} roomName="Room A" />
    );

    expect(screen.getByText("Room A")).toBeInTheDocument();
    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    expect(screen.getByText(/Sep 18, 2026/)).toBeInTheDocument();
  });

  it("does not render the cancel button when the booking is cancelled", () => {
    render(
      <BookingRow
        booking={makeBooking({ status: "CANCELLED" })}
        roomName="Room A"
      />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the cancel button for a CONFIRMED booking", () => {
    render(
      <BookingRow
        booking={makeBooking({ status: "CONFIRMED" })}
        roomName="Room A"
      />
    );

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });
});
