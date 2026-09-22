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
import { getUsers } from "./users";

describe("getUsers", () => {
  const originalFetch = global.fetch;

  const user = {
    id: "u1",
    name: "Sample User One",
    email: "user1@example.com",
    role: "USER",
    createdAt: "2026-09-17T09:00:00.000Z",
  };

  beforeEach(() => {
    process.env.API_URL = "http://api.test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it("returns the parsed user array on success", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([user]), { status: 200 })
    ) as unknown as typeof fetch;

    const users = await getUsers();

    expect(users).toEqual([user]);
  });

  it("attaches the Authorization header via authFetch and uses no-store", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 })
    ) as unknown as typeof fetch;

    await getUsers();

    const [url, init] = vi.mocked(global.fetch).mock.calls[0];
    expect(url).toBe("http://api.test/users");
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.get("Authorization")).toBe("Bearer jwt.token.value");
    expect(init?.cache).toBe("no-store");
  });

  it("redirects to /login?redirect=%2Fadmin on a 401", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 401 })
    ) as unknown as typeof fetch;

    await expect(getUsers()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith("/login?redirect=%2Fadmin");
  });

  it("throws a permission error on a 403", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 403 })
    ) as unknown as typeof fetch;

    await expect(getUsers()).rejects.toThrow(/permission/i);
  });

  it("throws on an unexpected non-ok status", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      })
    ) as unknown as typeof fetch;

    await expect(getUsers()).rejects.toThrow(/Failed to fetch users/);
  });
});
