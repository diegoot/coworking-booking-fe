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

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { createRoomAction } from "./create-room";

describe("createRoomAction", () => {
  const originalFetch = global.fetch;
  const validValues = {
    name: "Room A",
    capacity: 5,
    pricePerHour: 12.5,
  };

  beforeEach(() => {
    process.env.API_URL = "http://api.test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it("returns a validation error without calling the backend for invalid input", async () => {
    global.fetch = vi.fn();

    const result = await createRoomAction({
      name: "",
      capacity: -1,
      pricePerHour: 12.5,
    });

    expect(result).toEqual({ error: "Invalid room data" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("revalidates the rooms tag and does NOT redirect on success", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 201 })
      ) as unknown as typeof fetch;

    const result = await createRoomAction(validValues);

    expect(result).toBeUndefined();
    expect(updateTag).toHaveBeenCalledWith("rooms");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("sends real numbers for capacity/pricePerHour, not stringified numbers", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 201 })
      ) as unknown as typeof fetch;

    await createRoomAction(validValues);

    const [, init] = vi.mocked(global.fetch).mock.calls[0];
    const body = JSON.parse(init?.body as string);
    expect(body.capacity).toBe(5);
    expect(typeof body.capacity).toBe("number");
    expect(body.pricePerHour).toBe(12.5);
    expect(typeof body.pricePerHour).toBe("number");
  });

  it("maps a 401 to an authentication error", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 401 })
      ) as unknown as typeof fetch;

    const result = await createRoomAction(validValues);

    expect(result).toEqual({ error: "You must be logged in to create a room" });
  });

  it("maps a 403 to a permission error", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 403 })
      ) as unknown as typeof fetch;

    const result = await createRoomAction(validValues);

    expect(result).toEqual({
      error: "You don't have permission to create rooms",
    });
  });

  it("maps a 422 to a validation error", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 422 })
      ) as unknown as typeof fetch;

    const result = await createRoomAction(validValues);

    expect(result).toEqual({ error: "Invalid room data" });
  });

  it("maps an unexpected status to a generic fallback error", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 500 })
      ) as unknown as typeof fetch;

    const result = await createRoomAction(validValues);

    expect(result).toEqual({ error: "Failed to create room" });
  });
});
