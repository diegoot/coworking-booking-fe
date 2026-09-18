import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.API_URL = "http://api.test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sets the session cookies and returns the non-sensitive user on success", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: "jwt.token.value",
          user: {
            id: "1",
            name: "Ada Lovelace",
            email: "ada@example.com",
            role: "USER",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;

    const res = await POST(
      request({ email: "ada@example.com", password: "secret" })
    );

    // The JWT must never appear in the JSON body — only in the cookie.
    const body = await res.json();
    expect(body).toEqual({
      user: { id: "1", name: "Ada Lovelace", role: "USER" },
    });
    expect(JSON.stringify(body)).not.toContain("jwt.token.value");

    const cookieHeader = res.headers.get("set-cookie") ?? "";
    expect(cookieHeader).toContain("session_token=jwt.token.value");
    expect(cookieHeader).toContain("HttpOnly");
  });

  it("returns a 401-mapped error for invalid credentials", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 401 })
    ) as unknown as typeof fetch;

    const res = await POST(
      request({ email: "ada@example.com", password: "wrong" })
    );

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Invalid email or password" });
  });

  it("returns a 400 for an invalid request payload without calling the backend", async () => {
    global.fetch = vi.fn();

    const res = await POST(request({ email: "not-an-email" }));

    expect(res.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns a 502 when the backend response doesn't match the expected shape", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ unexpected: true }), { status: 200 })
    ) as unknown as typeof fetch;

    const res = await POST(
      request({ email: "ada@example.com", password: "secret" })
    );

    expect(res.status).toBe(502);
  });
});
