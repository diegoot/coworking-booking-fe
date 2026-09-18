import { afterEach, describe, expect, it, vi } from "vitest";

const getCookieMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: getCookieMock,
  })),
}));

import { authFetch, getSessionToken } from "./auth-fetch";

describe("getSessionToken", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the token when the session cookie is present", async () => {
    getCookieMock.mockReturnValue({ value: "jwt.token.value" });

    await expect(getSessionToken()).resolves.toBe("jwt.token.value");
  });

  it("returns null when the session cookie is missing", async () => {
    getCookieMock.mockReturnValue(undefined);

    await expect(getSessionToken()).resolves.toBeNull();
  });
});

describe("authFetch", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it("attaches the Authorization header when a token exists", async () => {
    getCookieMock.mockReturnValue({ value: "jwt.token.value" });
    global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));

    await authFetch("http://api.test/bookings");

    const [, init] = vi.mocked(global.fetch).mock.calls[0];
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.get("Authorization")).toBe("Bearer jwt.token.value");
  });

  it("calls fetch without an Authorization header when no token exists", async () => {
    getCookieMock.mockReturnValue(undefined);
    global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));

    await authFetch("http://api.test/bookings");

    const [, init] = vi.mocked(global.fetch).mock.calls[0];
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.has("Authorization")).toBe(false);
  });
});
