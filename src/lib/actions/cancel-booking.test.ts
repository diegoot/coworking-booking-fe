import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  updateTag: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: "jwt.token.value" })),
  })),
}));

import { updateTag } from "next/cache";
import { cancelBookingAction } from "./cancel-booking";

describe("cancelBookingAction", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.API_URL = "http://api.test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it("calls updateTag and returns undefined on success", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 200 })
    ) as unknown as typeof fetch;

    const result = await cancelBookingAction("b1");

    expect(result).toBeUndefined();
    expect(updateTag).toHaveBeenCalledWith("bookings");
    const [url, init] = vi.mocked(global.fetch).mock.calls[0];
    expect(url).toBe("http://api.test/bookings/b1");
    expect(init?.method).toBe("DELETE");
  });

  it("returns the already-cancelled error on a 409, still calling the backend", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 409 })
    ) as unknown as typeof fetch;

    const result = await cancelBookingAction("b1");

    expect(global.fetch).toHaveBeenCalled();
    expect(result).toEqual({ error: "This booking is already cancelled" });
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("maps a 401 to an authentication error", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 401 })
    ) as unknown as typeof fetch;

    const result = await cancelBookingAction("b1");

    expect(result).toEqual({
      error: "You must be logged in to cancel a booking",
    });
  });

  it("maps a 403 to a permission error", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 403 })
    ) as unknown as typeof fetch;

    const result = await cancelBookingAction("b1");

    expect(result).toEqual({
      error: "You don't have permission to cancel this booking",
    });
  });

  it("maps a 404 to a not-found error", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 404 })
    ) as unknown as typeof fetch;

    const result = await cancelBookingAction("b1");

    expect(result).toEqual({ error: "This booking no longer exists" });
  });

  it("returns a generic error on an unexpected status", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 500 })
    ) as unknown as typeof fetch;

    const result = await cancelBookingAction("b1");

    expect(result).toEqual({ error: "Failed to cancel booking" });
  });
});
