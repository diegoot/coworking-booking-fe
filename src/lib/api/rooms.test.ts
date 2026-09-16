import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRoomById, getRooms } from "./rooms";

describe("getRooms", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.API_URL = "http://api.test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("coerces pricePerHour/capacity strings from the backend into numbers", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          { id: "1", name: "Room A", capacity: "4", pricePerHour: "10" },
        ]),
        { status: 200 }
      )
    ) as unknown as typeof fetch;

    const rooms = await getRooms();

    expect(rooms).toEqual([
      { id: "1", name: "Room A", capacity: 4, pricePerHour: 10 },
    ]);
    expect(typeof rooms[0].capacity).toBe("number");
    expect(typeof rooms[0].pricePerHour).toBe("number");
  });

  it("throws when the backend responds with a non-OK status", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      })
    ) as unknown as typeof fetch;

    await expect(getRooms()).rejects.toThrow(/Failed to fetch rooms/);
  });
});

describe("getRoomById", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.API_URL = "http://api.test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns the parsed room when the backend finds it", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "1",
          name: "Room A",
          capacity: "4",
          pricePerHour: "10",
        }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;

    const room = await getRoomById("1");

    expect(room).toEqual({
      id: "1",
      name: "Room A",
      capacity: 4,
      pricePerHour: 10,
    });
  });

  it("returns null when the backend responds 404", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 404 })
    ) as unknown as typeof fetch;

    const room = await getRoomById("does-not-exist");

    expect(room).toBeNull();
  });

  it("throws when the backend responds with a non-OK, non-404 status", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      })
    ) as unknown as typeof fetch;

    await expect(getRoomById("1")).rejects.toThrow(/Failed to fetch room/);
  });
});
