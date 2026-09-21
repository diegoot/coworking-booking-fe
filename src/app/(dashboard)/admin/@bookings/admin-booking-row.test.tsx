import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminBookingRow } from "./admin-booking-row";
import type { Booking, BookingStatus } from "@/lib/schemas/booking";

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

describe("AdminBookingRow", () => {
  it("renders the resolved room name, formatted date/time, and status badge text", () => {
    render(
      <AdminBookingRow
        booking={makeBooking({ status: "PENDING" })}
        roomName="Room A"
      />
    );

    expect(screen.getByText("Room A")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText(/Sep 18, 2026/)).toBeInTheDocument();
  });

  it.each<BookingStatus>(["CONFIRMED", "PENDING", "CANCELLED"])(
    "does not render a Cancel button or any button at all for status %s",
    (status) => {
      render(
        <AdminBookingRow
          booking={makeBooking({ status })}
          roomName="Room A"
        />
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      // Note: `/cancel/i` would false-positive-match the CANCELLED status
      // badge text itself, so assert there's no *button* labelled Cancel
      // specifically instead.
      expect(
        screen.queryByRole("button", { name: /cancel/i })
      ).not.toBeInTheDocument();
    }
  );
});
