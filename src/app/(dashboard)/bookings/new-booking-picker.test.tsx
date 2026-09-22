import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewBookingPicker } from "./new-booking-picker";
import type { Room } from "@/lib/data/rooms";

const rooms: Room[] = [
  { id: "room-1", name: "Room A", capacity: 4, pricePerHour: 10 },
  { id: "room-2", name: "Room B", capacity: 8, pricePerHour: 18 },
];

describe("NewBookingPicker", () => {
  it("renders the room picker and a disabled Book now immediately, no toggle", () => {
    render(<NewBookingPicker rooms={rooms} />);

    expect(screen.getByText("New booking")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Room A (4 people, $10/hour)")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Book now" })).not.toBeInTheDocument();
    expect(screen.getByText("Book now")).toBeInTheDocument();
  });

  it("turns Book now into a link to the selected room once one is picked", async () => {
    const user = userEvent.setup();
    render(<NewBookingPicker rooms={rooms} />);

    await user.selectOptions(screen.getByRole("combobox"), "room-2");

    const link = screen.getByRole("link", { name: "Book now" });
    expect(link).toHaveAttribute("href", "/bookings/new?room=room-2");
  });
});
