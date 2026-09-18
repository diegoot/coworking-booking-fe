import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: "jwt.token.value" })),
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

import { redirect } from "next/navigation";
import { getRoomAvailability } from "./bookings";

describe("getRoomAvailability", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.API_URL = "http://api.test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns the parsed availability response on success", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          roomId: "1",
          date: "2026-09-18",
          slots: [
            {
              start: "2026-09-18T09:00:00.000Z",
              end: "2026-09-18T10:00:00.000Z",
              status: "free",
            },
          ],
        }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;

    const availability = await getRoomAvailability("1", "2026-09-18");

    expect(availability).toEqual({
      roomId: "1",
      date: "2026-09-18",
      slots: [
        {
          start: "2026-09-18T09:00:00.000Z",
          end: "2026-09-18T10:00:00.000Z",
          status: "free",
        },
      ],
    });
  });

  it("attaches the Authorization header via authFetch", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ roomId: "1", date: "2026-09-18", slots: [] }), {
        status: 200,
      })
    );

    await getRoomAvailability("1", "2026-09-18");

    const [url, init] = vi.mocked(global.fetch).mock.calls[0];
    expect(url).toBe(
      "http://api.test/rooms/1/availability?date=2026-09-18"
    );
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.get("Authorization")).toBe("Bearer jwt.token.value");
    expect(init?.cache).toBe("no-store");
  });

  it("returns null when the backend responds 404", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 404 })
    ) as unknown as typeof fetch;

    const slots = await getRoomAvailability("does-not-exist", "2026-09-18");

    expect(slots).toBeNull();
  });

  it("redirects to login with a redirect-back target on a 401", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 401 })
    ) as unknown as typeof fetch;

    await expect(getRoomAvailability("1", "2026-09-18")).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(redirect).toHaveBeenCalledWith(
      "/login?redirect=%2Fbookings%2Fnew%3Froom%3D1"
    );
  });

  it("throws when the backend responds with a non-OK, non-404 status", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      })
    ) as unknown as typeof fetch;

    await expect(getRoomAvailability("1", "2026-09-18")).rejects.toThrow(
      /Failed to fetch availability/
    );
  });

  it("throws instead of returning malformed data when the response fails Zod validation", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          roomId: "1",
          date: "2026-09-18",
          slots: [{ start: "2026-09-18T09:00:00.000Z", status: "unknown" }],
        }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;

    await expect(getRoomAvailability("1", "2026-09-18")).rejects.toThrow();
  });
});
