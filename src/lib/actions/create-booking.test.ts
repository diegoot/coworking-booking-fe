import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("next/cache", () => ({
  updateTag: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: "jwt.token.value" })),
  })),
}));

import { updateTag } from "next/cache";
import { createBookingAction } from "./create-booking";

describe("createBookingAction", () => {
  const originalFetch = global.fetch;
  const validValues = {
    roomId: "1",
    startTime: "2026-09-18T09:00:00.000Z",
    endTime: "2026-09-18T10:00:00.000Z",
  };

  beforeEach(() => {
    process.env.API_URL = "http://api.test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it("revalidates the bookings tag and redirects on success", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 201 })
    ) as unknown as typeof fetch;

    await expect(createBookingAction(validValues)).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(updateTag).toHaveBeenCalledWith("bookings");
  });

  it("maps a 409 to a slot-taken error instead of redirecting", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 409 })
    ) as unknown as typeof fetch;

    const result = await createBookingAction(validValues);

    expect(result).toEqual({ error: "This slot is no longer available" });
  });

  it("maps a 401 to an authentication error instead of redirecting", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 401 })
    ) as unknown as typeof fetch;

    const result = await createBookingAction(validValues);

    expect(result).toEqual({ error: "You must be logged in to book a room" });
  });

  it("maps a 403 to an admin-can't-book error instead of redirecting", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 403 })
    ) as unknown as typeof fetch;

    const result = await createBookingAction(validValues);

    expect(result).toEqual({ error: "Admin accounts can't book rooms" });
  });

  it("returns a validation error without calling the backend for invalid input", async () => {
    global.fetch = vi.fn();

    const result = await createBookingAction({
      roomId: "",
      startTime: "not-a-date",
      endTime: "not-a-date",
    });

    expect(result).toEqual({ error: "Invalid booking data" });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
