import { afterEach, describe, expect, it, vi } from "vitest";

const getCookieMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: getCookieMock,
  })),
}));

import { getCurrentUser } from "./get-current-user";

describe("getCurrentUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the parsed user when the cookie is present and valid", async () => {
    getCookieMock.mockReturnValue({
      value: JSON.stringify({ id: "u1", name: "Sample User", role: "USER" }),
    });

    await expect(getCurrentUser()).resolves.toEqual({
      id: "u1",
      name: "Sample User",
      role: "USER",
    });
  });

  it("returns null when the cookie is missing", async () => {
    getCookieMock.mockReturnValue(undefined);

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns null when the cookie's JSON is malformed", async () => {
    getCookieMock.mockReturnValue({ value: "{not json" });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns null when the cookie's shape doesn't match the schema", async () => {
    getCookieMock.mockReturnValue({ value: JSON.stringify({ id: "u1" }) });

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});
