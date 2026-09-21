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
import { getRoomAvailability, getMyBookings, getBookingsForUser } from "./bookings";

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

describe("getMyBookings", () => {
  const originalFetch = global.fetch;

  const booking = {
    id: "b1",
    userId: "u1",
    roomId: "1",
    startTime: "2026-09-18T09:00:00.000Z",
    endTime: "2026-09-18T10:00:00.000Z",
    status: "CONFIRMED",
    createdAt: "2026-09-17T09:00:00.000Z",
  };

  beforeEach(() => {
    process.env.API_URL = "http://api.test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns the parsed booking array on success", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([booking]), { status: 200 })
    ) as unknown as typeof fetch;

    const bookings = await getMyBookings();

    expect(bookings).toEqual([booking]);
  });

  it("attaches the Authorization header via authFetch and tags the fetch instead of using no-store", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 })
    ) as unknown as typeof fetch;

    await getMyBookings();

    const [url, init] = vi.mocked(global.fetch).mock.calls[0];
    expect(url).toBe("http://api.test/bookings/me");
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.get("Authorization")).toBe("Bearer jwt.token.value");
    // Deliberate design decision (see this function's doc comment): tag
    // invalidation, not literal `no-store`, is what keeps this fresh.
    expect(init?.next).toEqual({ tags: ["bookings"] });
    expect(init?.cache).toBeUndefined();
  });

  it("redirects to login with a redirect-back target on a 401", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 401 })
    ) as unknown as typeof fetch;

    await expect(getMyBookings()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith("/login?redirect=%2Fbookings");
  });

  it("throws when the backend responds with a non-401, non-OK status", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      })
    ) as unknown as typeof fetch;

    await expect(getMyBookings()).rejects.toThrow(/Failed to fetch bookings/);
  });
});

describe("getBookingsForUser", () => {
  const originalFetch = global.fetch;

  const booking = {
    id: "b1",
    userId: "u2",
    roomId: "1",
    startTime: "2026-09-18T09:00:00.000Z",
    endTime: "2026-09-18T10:00:00.000Z",
    status: "CONFIRMED",
    createdAt: "2026-09-17T09:00:00.000Z",
  };

  beforeEach(() => {
    process.env.API_URL = "http://api.test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns the parsed booking array on success for a given userId", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([booking]), { status: 200 })
    ) as unknown as typeof fetch;

    const bookings = await getBookingsForUser("u2");

    expect(bookings).toEqual([booking]);
  });

  it("attaches the Authorization header via authFetch and tags the fetch with admin-bookings, not bookings", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 })
    ) as unknown as typeof fetch;

    await getBookingsForUser("u2");

    const [url, init] = vi.mocked(global.fetch).mock.calls[0];
    expect(url).toBe("http://api.test/bookings/u2");
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.get("Authorization")).toBe("Bearer jwt.token.value");
    expect(init?.next).toEqual({ tags: ["admin-bookings"] });
    expect(init?.cache).toBeUndefined();
  });

  it("redirects to /login?redirect=%2Fadmin on a 401", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 401 })
    ) as unknown as typeof fetch;

    await expect(getBookingsForUser("u2")).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith("/login?redirect=%2Fadmin");
  });

  it("throws a permission error on a 403", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 403 })
    ) as unknown as typeof fetch;

    await expect(getBookingsForUser("u2")).rejects.toThrow(/permission/i);
  });

  it("returns an empty array when the backend returns 200 with []", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 })
    ) as unknown as typeof fetch;

    const bookings = await getBookingsForUser("no-such-user");

    expect(bookings).toEqual([]);
  });

  it("throws on an unexpected non-ok status", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      })
    ) as unknown as typeof fetch;

    await expect(getBookingsForUser("u2")).rejects.toThrow(
      /Failed to fetch bookings for user/
    );
  });
});
