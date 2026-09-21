import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateRoomForm } from "./create-room-form";
import { createRoomAction } from "@/lib/actions/create-room";

vi.mock("@/lib/actions/create-room", () => ({
  createRoomAction: vi.fn(),
}));

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockedCreateRoomAction = vi.mocked(createRoomAction);

describe("CreateRoomForm", () => {
  it("renders Name/Capacity/Price per hour fields and a submit button", () => {
    render(<CreateRoomForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/capacity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price per hour/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create room/i })
    ).toBeInTheDocument();
  });

  it("blocks submission for invalid input without calling createRoomAction", async () => {
    const user = userEvent.setup();
    render(<CreateRoomForm />);

    await user.type(screen.getByLabelText(/capacity/i), "5");
    await user.type(screen.getByLabelText(/price per hour/i), "10");
    await user.click(screen.getByRole("button", { name: /create room/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(mockedCreateRoomAction).not.toHaveBeenCalled();
  });

  it("calls createRoomAction with correctly-typed values on valid submit", async () => {
    mockedCreateRoomAction.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CreateRoomForm />);

    await user.type(screen.getByLabelText(/name/i), "Room A");
    await user.type(screen.getByLabelText(/capacity/i), "5");
    await user.type(screen.getByLabelText(/price per hour/i), "12.5");
    await user.click(screen.getByRole("button", { name: /create room/i }));

    await waitFor(() => expect(mockedCreateRoomAction).toHaveBeenCalled());
    expect(mockedCreateRoomAction).toHaveBeenCalledWith({
      name: "Room A",
      capacity: 5,
      pricePerHour: 12.5,
    });
  });

  it("shows the returned error inline on failure", async () => {
    mockedCreateRoomAction.mockResolvedValue({
      error: "You don't have permission to create rooms",
    });
    const user = userEvent.setup();
    render(<CreateRoomForm />);

    await user.type(screen.getByLabelText(/name/i), "Room A");
    await user.type(screen.getByLabelText(/capacity/i), "5");
    await user.type(screen.getByLabelText(/price per hour/i), "12.5");
    await user.click(screen.getByRole("button", { name: /create room/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You don't have permission to create rooms"
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("calls router.refresh() and resets the form fields on success", async () => {
    mockedCreateRoomAction.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CreateRoomForm />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const capacityInput = screen.getByLabelText(
      /capacity/i
    ) as HTMLInputElement;
    const priceInput = screen.getByLabelText(
      /price per hour/i
    ) as HTMLInputElement;

    await user.type(nameInput, "Room A");
    await user.type(capacityInput, "5");
    await user.type(priceInput, "12.5");
    await user.click(screen.getByRole("button", { name: /create room/i }));

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    await waitFor(() => expect(nameInput.value).toBe(""));
    expect(capacityInput.value).toBe("");
    expect(priceInput.value).toBe("");
  });

  it("disables the submit button and shows a pending label while the action is in flight", async () => {
    let resolveAction!: (value: { error: string } | undefined) => void;
    mockedCreateRoomAction.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        })
    );
    const user = userEvent.setup();
    render(<CreateRoomForm />);

    await user.type(screen.getByLabelText(/name/i), "Room A");
    await user.type(screen.getByLabelText(/capacity/i), "5");
    await user.type(screen.getByLabelText(/price per hour/i), "12.5");
    await user.click(screen.getByRole("button", { name: /create room/i }));

    const button = screen.getByRole("button", { name: /creating\.\.\./i });
    expect(button).toBeDisabled();

    resolveAction(undefined);
    await waitFor(() => expect(button).not.toBeDisabled());
  });
});
