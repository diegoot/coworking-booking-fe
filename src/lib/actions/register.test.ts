import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerAction } from "./register";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

describe("registerAction", () => {
  const originalFetch = global.fetch;
  const validValues = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "supersecret",
  };

  beforeEach(() => {
    process.env.API_URL = "http://api.test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it("redirects to /login?registered=1 on a successful registration", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: "jwt.token.value",
          user: { id: "1", name: "Ada Lovelace", role: "USER" },
        }),
        { status: 201 }
      )
    ) as unknown as typeof fetch;

    await expect(registerAction(validValues)).rejects.toThrow(
      "NEXT_REDIRECT"
    );
  });

  it("maps a 409 to a duplicate-email error instead of redirecting", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 409 })
    ) as unknown as typeof fetch;

    const result = await registerAction(validValues);

    expect(result).toEqual({
      error: "An account with that email already exists",
    });
  });

  it("returns a validation error without calling the backend for invalid input", async () => {
    global.fetch = vi.fn();

    const result = await registerAction({
      name: "",
      email: "not-an-email",
      password: "short",
    });

    expect(result).toEqual({ error: "Invalid registration data" });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
