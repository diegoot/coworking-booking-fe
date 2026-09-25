import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { SessionHydrator } from "./session-hydrator";
import { useSessionStore } from "@/lib/store/session";
import { SESSION_USER_COOKIE } from "@/lib/constants/cookies";

const mockedPathname = vi.hoisted(() => ({ value: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => mockedPathname.value),
}));

function setCookie(value: string) {
  document.cookie = `${SESSION_USER_COOKIE}=${encodeURIComponent(value)}`;
}

function clearCookie() {
  document.cookie = `${SESSION_USER_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function hasSessionCookie() {
  return document.cookie
    .split("; ")
    .some((entry) => entry.startsWith(`${SESSION_USER_COOKIE}=`));
}

describe("SessionHydrator", () => {
  afterEach(() => {
    clearCookie();
    useSessionStore.setState({ session: undefined });
    mockedPathname.value = "/";
  });

  it("resolves the session synchronously from a valid cookie", () => {
    setCookie(JSON.stringify({ id: "1", name: "Sample User", role: "USER" }));

    render(<SessionHydrator />);

    expect(useSessionStore.getState().session).toEqual({
      id: "1",
      name: "Sample User",
      role: "USER",
    });
  });

  it("resolves to null when no cookie is present", () => {
    render(<SessionHydrator />);

    expect(useSessionStore.getState().session).toBeNull();
  });

  it("resolves to null when the cookie is malformed", () => {
    setCookie("not-json");

    render(<SessionHydrator />);

    expect(useSessionStore.getState().session).toBeNull();
  });

  it("resolves to null when the cookie fails schema validation", () => {
    setCookie(JSON.stringify({ id: "1" }));

    render(<SessionHydrator />);

    expect(useSessionStore.getState().session).toBeNull();
  });

  it("clears a stale session cookie and store on /login, even if the cookie still says logged in", () => {
    // Simulates landing on /login via a Server Component redirect
    // (`getUsers`/`getBookingsForUser` on an expired JWT) — nothing
    // clears the cookie on that path, so it's still sitting there.
    setCookie(JSON.stringify({ id: "1", name: "Sample User", role: "USER" }));
    mockedPathname.value = "/login";

    render(<SessionHydrator />);

    expect(useSessionStore.getState().session).toBeNull();
    expect(hasSessionCookie()).toBe(false);
  });
});
