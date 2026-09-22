import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingForm } from "./booking-form";
import { createBookingAction } from "@/lib/actions/create-booking";
import type { AvailabilitySlot } from "@/lib/schemas/booking";

vi.mock("@/lib/actions/create-booking", () => ({
  createBookingAction: vi.fn(),
}));

const mockedCreateBookingAction = vi.mocked(createBookingAction);

// Offsets from now, not fixed dates: `BookingForm` grays out any slot
// whose start has already passed (see `isPast`), so a "free" fixture
// meant to be selectable has to stay ahead of whenever the test suite
// actually runs.
function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

const slots: AvailabilitySlot[] = [
  { start: hoursFromNow(1), end: hoursFromNow(2), status: "free" },
  { start: hoursFromNow(2), end: hoursFromNow(3), status: "busy" },
  { start: hoursFromNow(3), end: hoursFromNow(4), status: "free" },
];

describe("BookingForm", () => {
  it("renders every slot in one list, only the free ones as selectable radios", () => {
    render(<BookingForm roomId="room-1" date="2026-09-22" slots={slots} />);

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    // The busy slot still shows up in the list, just not as a radio.
    expect(screen.getByText("Busy")).toBeInTheDocument();
  });

  it("blocks submission when no slot is selected", async () => {
    const user = userEvent.setup();
    render(<BookingForm roomId="room-1" date="2026-09-22" slots={slots} />);

    await user.click(screen.getByRole("button", { name: /book now/i }));

    expect(
      await screen.findByText(/please select an available time slot/i)
    ).toBeInTheDocument();
    expect(mockedCreateBookingAction).not.toHaveBeenCalled();
  });

  it("shows a server error returned by the action", async () => {
    mockedCreateBookingAction.mockResolvedValue({
      error: "This slot is no longer available",
    });
    const user = userEvent.setup();
    render(<BookingForm roomId="room-1" date="2026-09-22" slots={slots} />);

    await user.click(screen.getAllByRole("radio")[0]);
    await user.click(screen.getByRole("button", { name: /book now/i }));

    expect(
      await screen.findByText(/this slot is no longer available/i)
    ).toBeInTheDocument();
  });

  it("disables the submit button while the action is pending", async () => {
    let resolveAction!: (value: { error: string } | undefined) => void;
    mockedCreateBookingAction.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        })
    );
    const user = userEvent.setup();
    render(<BookingForm roomId="room-1" date="2026-09-22" slots={slots} />);

    await user.click(screen.getAllByRole("radio")[0]);
    await user.click(screen.getByRole("button", { name: /book now/i }));

    const button = screen.getByRole("button", { name: /booking\.\.\./i });
    expect(button).toBeDisabled();

    resolveAction(undefined);
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it("submits the payload matching the selected slot, not just any free slot", async () => {
    mockedCreateBookingAction.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<BookingForm roomId="room-1" date="2026-09-22" slots={slots} />);

    // slots[2] (the second free slot, since slots[1] is busy) is the
    // second radio rendered.
    await user.click(screen.getAllByRole("radio")[1]);
    await user.click(screen.getByRole("button", { name: /book now/i }));

    await waitFor(() => expect(mockedCreateBookingAction).toHaveBeenCalled());
    expect(mockedCreateBookingAction).toHaveBeenCalledWith({
      roomId: "room-1",
      startTime: slots[2].start,
      endTime: slots[2].end,
    });
  });

  it("disables submission when there are no free slots", () => {
    const busySlots: AvailabilitySlot[] = [
      { start: hoursFromNow(1), end: hoursFromNow(2), status: "busy" },
    ];
    render(<BookingForm roomId="room-1" date="2026-09-22" slots={busySlots} />);

    expect(screen.getByRole("button", { name: /book now/i })).toBeDisabled();
  });

  it("grays out a free slot whose time has already passed today, labeled Past", () => {
    const pastFreeSlots: AvailabilitySlot[] = [
      {
        start: "2026-09-18T09:00:00.000Z",
        end: "2026-09-18T10:00:00.000Z",
        status: "free",
      },
    ];
    render(<BookingForm roomId="room-1" date="2026-09-22" slots={pastFreeSlots} />);

    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByText("Past")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /book now/i })).toBeDisabled();
  });
});
