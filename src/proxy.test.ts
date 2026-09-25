import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import proxy, { config } from "./proxy";
import {
  SESSION_TOKEN_COOKIE,
  SESSION_USER_COOKIE,
} from "@/lib/constants/cookies";

function request(url: string, cookie?: string) {
  const headers = new Headers();
  if (cookie) {
    headers.set("cookie", cookie);
  }
  return new NextRequest(new Request(url, { headers }));
}

function fakeJwt(expiresInSeconds: number): string {
  const payload = { exp: Math.floor(Date.now() / 1000) + expiresInSeconds };
  const base64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${base64}.signature`;
}

const validToken = fakeJwt(3600);

describe("proxy", () => {
  it("redirects unauthenticated requests to /bookings to /login with ?redirect=", () => {
    const res = proxy(request("http://localhost/bookings/new?room=1"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost/login?redirect=%2Fbookings%2Fnew%3Froom%3D1"
    );
  });

  it("clears a stale session_user cookie when session_token is missing", () => {
    const res = proxy(
      request(
        "http://localhost/bookings/new?room=1",
        `${SESSION_USER_COOKIE}=${encodeURIComponent(
          JSON.stringify({ id: "1", name: "Jane", role: "USER" })
        )}`
      )
    );

    expect(res.status).toBe(307);
    expect(res.cookies.get(SESSION_USER_COOKIE)?.value).toBe("");
  });

  it("redirects to /login when session_token is present but its JWT has expired", () => {
    const res = proxy(
      request(
        "http://localhost/admin",
        `${SESSION_TOKEN_COOKIE}=${fakeJwt(-60)}; ${SESSION_USER_COOKIE}=${encodeURIComponent(
          JSON.stringify({ id: "1", name: "Jane", role: "ADMIN" })
        )}`
      )
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost/login?redirect=%2Fadmin"
    );
    expect(res.cookies.get(SESSION_USER_COOKIE)?.value).toBe("");
  });

  it("redirects to /login when session_token is present but malformed", () => {
    const res = proxy(
      request("http://localhost/bookings", `${SESSION_TOKEN_COOKIE}=not-a-jwt`)
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost/login?redirect=%2Fbookings"
    );
  });

  it("passes through authenticated requests (session cookie present)", () => {
    const res = proxy(
      request(
        "http://localhost/bookings/new?room=1",
        `${SESSION_TOKEN_COOKIE}=${validToken}`
      )
    );

    // NextResponse.next() carries no redirect/rewrite of its own.
    expect(res.headers.get("location")).toBeNull();
  });

  it("scopes the matcher to /bookings and /admin only, leaving public routes untouched", () => {
    // Next.js itself decides whether to invoke `proxy` for a given
    // request based on this exported `config.matcher`, before the
    // function ever runs (see `node_modules/next/dist/docs/.../proxy.md`
    // — matcher values must be static so they can be analyzed at build
    // time). Asserting the literal matcher is the correct way to pin
    // "public routes like `/` and `/how-it-works` are untouched", rather
    // than re-implementing Next's own path-to-regexp matching here.
    expect(config.matcher).toEqual(["/bookings/:path*", "/admin/:path*"]);
  });

  it("redirects /admin to / when session_token is present but session_user is absent", () => {
    const res = proxy(
      request(
        "http://localhost/admin",
        `${SESSION_TOKEN_COOKIE}=${validToken}`
      )
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it("redirects /admin to / when session_user is unparseable JSON", () => {
    const res = proxy(
      request(
        "http://localhost/admin",
        `${SESSION_TOKEN_COOKIE}=${validToken}; ${SESSION_USER_COOKIE}=not-json`
      )
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it("redirects /admin to / when session_user fails schema validation", () => {
    const res = proxy(
      request(
        "http://localhost/admin",
        `${SESSION_TOKEN_COOKIE}=${validToken}; ${SESSION_USER_COOKIE}=${encodeURIComponent(
          JSON.stringify({ id: "1" })
        )}`
      )
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it("redirects /admin to / when session_user has role USER", () => {
    const res = proxy(
      request(
        "http://localhost/admin",
        `${SESSION_TOKEN_COOKIE}=${validToken}; ${SESSION_USER_COOKIE}=${encodeURIComponent(
          JSON.stringify({ id: "1", name: "Jane", role: "USER" })
        )}`
      )
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it("passes through /admin when session_user has role ADMIN", () => {
    const res = proxy(
      request(
        "http://localhost/admin",
        `${SESSION_TOKEN_COOKIE}=${validToken}; ${SESSION_USER_COOKIE}=${encodeURIComponent(
          JSON.stringify({ id: "1", name: "Jane", role: "ADMIN" })
        )}`
      )
    );

    expect(res.headers.get("location")).toBeNull();
  });

  it("does not apply the /admin role check to other protected routes", () => {
    const res = proxy(
      request(
        "http://localhost/bookings/new?room=1",
        `${SESSION_TOKEN_COOKIE}=${validToken}`
      )
    );

    // No session_user cookie at all, yet a non-/admin path still just
    // passes through on token presence alone, as before.
    expect(res.headers.get("location")).toBeNull();
  });
});
