import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CancelButton } from "./cancel-button";
import { cancelBookingAction } from "@/lib/actions/cancel-booking";

vi.mock("@/lib/actions/cancel-booking", () => ({
  cancelBookingAction: vi.fn(),
}));

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockedCancelBookingAction = vi.mocked(cancelBookingAction);

describe("CancelButton", () => {
  it("renders a Cancel button", () => {
    render(<CancelButton bookingId="b1" />);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("calls cancelBookingAction with the given bookingId on click", async () => {
    mockedCancelBookingAction.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CancelButton bookingId="b1" />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(mockedCancelBookingAction).toHaveBeenCalledWith("b1")
    );
  });

  it("shows the returned error inline on failure, and still refreshes to resync the row", async () => {
    mockedCancelBookingAction.mockResolvedValue({
      error: "This booking is already cancelled",
    });
    const user = userEvent.setup();
    render(<CancelButton bookingId="b1" />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This booking is already cancelled"
    );
    // A 404/409 means the booking is already gone/cancelled (e.g. a
    // second tab beat this one to it) — refresh so the stale row
    // resyncs to the real current state instead of staying actionable.
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("calls router.refresh() on success", async () => {
    mockedCancelBookingAction.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CancelButton bookingId="b1" />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it("disables itself and shows a pending label while the action is in flight", async () => {
    let resolveAction!: (
      value: { error: string } | undefined
    ) => void;
    mockedCancelBookingAction.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        })
    );
    const user = userEvent.setup();
    render(<CancelButton bookingId="b1" />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    const button = screen.getByRole("button", { name: "Cancelling..." });
    expect(button).toBeDisabled();

    resolveAction(undefined);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled()
    );
  });
});
