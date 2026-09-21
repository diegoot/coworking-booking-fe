import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminBookingRow } from "./admin-booking-row";
import type { Booking } from "@/lib/schemas/booking";

vi.mock("@/lib/actions/cancel-booking", () => ({
  cancelBookingAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

// Default slot is an hour from now, one hour long, so `isBookingPast`
// treats it as upcoming by default — tests that care about a past
// booking pass an explicit past startTime/endTime instead.
function makeBooking(overrides: Partial<Booking> = {}): Booking {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    id: "b1",
    userId: "u1",
    roomId: "room-1",
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    status: "CONFIRMED",
    createdAt: "2026-09-17T09:00:00.000Z",
    ...overrides,
  };
}

describe("AdminBookingRow", () => {
  it("renders the resolved room name, formatted date/time, and status badge text", () => {
    render(
      <AdminBookingRow
        booking={makeBooking({
          status: "CONFIRMED",
          startTime: "2026-09-18T09:00:00.000Z",
          endTime: "2026-09-18T10:00:00.000Z",
        })}
        roomName="Room A"
      />
    );

    expect(screen.getByText("Room A")).toBeInTheDocument();
    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    expect(screen.getByText(/Sep 18, 2026/)).toBeInTheDocument();
  });

  it("renders a Cancel button for an upcoming CONFIRMED booking — an admin can cancel any user's booking", () => {
    render(
      <AdminBookingRow
        booking={makeBooking({ status: "CONFIRMED" })}
        roomName="Room A"
      />
    );

    expect(
      screen.getByRole("button", { name: "Cancel" })
    ).toBeInTheDocument();
  });

  it("does not render a Cancel button for a CANCELLED booking", () => {
    render(
      <AdminBookingRow
        booking={makeBooking({ status: "CANCELLED" })}
        roomName="Room A"
      />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not render a Cancel button once the booking's slot has ended", () => {
    render(
      <AdminBookingRow
        booking={makeBooking({
          status: "CONFIRMED",
          startTime: "2026-09-18T09:00:00.000Z",
          endTime: "2026-09-18T10:00:00.000Z",
        })}
        roomName="Room A"
      />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
